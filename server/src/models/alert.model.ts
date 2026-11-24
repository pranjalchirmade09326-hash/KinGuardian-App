import { query } from '../db/pool';
import { Alert, AlertType, AlertSeverity, AlertStatus, LocationCoords } from '../types';

export interface CreateAlertInput {
  userId: string;
  type: AlertType;
  severity?: AlertSeverity;
  description: string;
  location_coords?: LocationCoords | null;
  location_name?: string | null;
  metadata?: Record<string, any>;
  status?: AlertStatus;
}

export interface ListAlertsFilter {
  userId?: string;
  status?: AlertStatus | string;
  severity?: AlertSeverity | string;
  limit?: number;
  offset?: number;
}

export class AlertModel {
  static async create(input: CreateAlertInput): Promise<Alert> {
    const text = `
      INSERT INTO alerts (
        user_id, type, severity, status, location_coords, location_name, description, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const params = [
      input.userId,
      input.type,
      input.severity || 'medium',
      input.status || 'triggered',
      input.location_coords ? JSON.stringify(input.location_coords) : null,
      input.location_name || null,
      input.description,
      JSON.stringify(input.metadata || {}),
    ];

    const result = await query<Alert>(text, params);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Alert | null> {
    const text = 'SELECT * FROM alerts WHERE id = $1';
    const result = await query<Alert>(text, [id]);
    return result.rows[0] || null;
  }

  static async list(filter: ListAlertsFilter = {}): Promise<{ alerts: Alert[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filter.userId);
    }
    if (filter.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filter.status);
    }
    if (filter.severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(filter.severity);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM alerts ${whereClause}`;
    const countRes = await query<{ total: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const limit = filter.limit && filter.limit > 0 ? filter.limit : 50;
    const offset = filter.offset && filter.offset >= 0 ? filter.offset : 0;

    const dataSql = `
      SELECT * FROM alerts
      ${whereClause}
      ORDER BY triggered_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataParams = [...params, limit, offset];

    const dataRes = await query<Alert>(dataSql, dataParams);
    return { alerts: dataRes.rows, total };
  }

  static async acknowledge(id: string, acknowledgedBy: string): Promise<Alert | null> {
    const text = `
      UPDATE alerts
      SET status = 'acknowledged',
          acknowledged_at = CURRENT_TIMESTAMP,
          acknowledged_by = $2
      WHERE id = $1
      RETURNING *;
    `;
    const result = await query<Alert>(text, [id, acknowledgedBy]);
    return result.rows[0] || null;
  }

  static async resolve(id: string, resolutionNotes: string): Promise<Alert | null> {
    const text = `
      UPDATE alerts
      SET status = 'resolved',
          resolved_at = CURRENT_TIMESTAMP,
          resolution_notes = $2
      WHERE id = $1
      RETURNING *;
    `;
    const result = await query<Alert>(text, [id, resolutionNotes]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const text = 'DELETE FROM alerts WHERE id = $1 RETURNING id';
    const result = await query<{ id: string }>(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
