import { query } from '../db/pool';
import { EmergencyContact } from '../types';

export interface CreateContactInput {
  name: string;
  relationship: string;
  phone: string;
  email?: string | null;
  is_primary?: boolean;
  priority?: number;
}

export interface UpdateContactInput {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string | null;
  is_primary?: boolean;
  priority?: number;
}

export class ContactModel {
  static async create(userId: string, input: CreateContactInput): Promise<EmergencyContact> {
    const isPrimary = input.is_primary ?? false;
    const priority = input.priority !== undefined && input.priority >= 0 ? input.priority : 1;

    // If marked primary, unset other primaries for this user
    if (isPrimary) {
      await query(
        'UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const text = `
      INSERT INTO emergency_contacts (
        user_id, name, relationship, phone, email, is_primary, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const params = [
      userId,
      input.name,
      input.relationship,
      input.phone,
      input.email || null,
      isPrimary,
      priority,
    ];

    const result = await query<EmergencyContact>(text, params);
    return result.rows[0];
  }

  static async findById(id: string): Promise<EmergencyContact | null> {
    const text = 'SELECT * FROM emergency_contacts WHERE id = $1';
    const result = await query<EmergencyContact>(text, [id]);
    return result.rows[0] || null;
  }

  static async listByUserId(userId: string): Promise<EmergencyContact[]> {
    const text = `
      SELECT * FROM emergency_contacts
      WHERE user_id = $1
      ORDER BY priority ASC, created_at ASC;
    `;
    const result = await query<EmergencyContact>(text, [userId]);
    return result.rows;
  }

  static async update(id: string, input: UpdateContactInput): Promise<EmergencyContact | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (input.is_primary === true) {
      await query(
        'UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1 AND id != $2',
        [existing.user_id, id]
      );
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(input.name);
    }
    if (input.relationship !== undefined) {
      fields.push(`relationship = $${paramIndex++}`);
      params.push(input.relationship);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      params.push(input.phone);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      params.push(input.email);
    }
    if (input.is_primary !== undefined) {
      fields.push(`is_primary = $${paramIndex++}`);
      params.push(input.is_primary);
    }
    if (input.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`);
      params.push(input.priority);
    }

    if (fields.length === 0) {
      return existing;
    }

    params.push(id);
    const sql = `
      UPDATE emergency_contacts
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query<EmergencyContact>(sql, params);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const text = 'DELETE FROM emergency_contacts WHERE id = $1 RETURNING id';
    const result = await query<{ id: string }>(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
