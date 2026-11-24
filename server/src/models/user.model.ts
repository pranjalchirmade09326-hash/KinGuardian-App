import { query } from '../db/pool';
import { User, UserRole, BloodGroup } from '../types';

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string | null;
  role?: UserRole;
  blood_group?: BloodGroup | null;
  medical_conditions?: string[] | any[];
  allergies?: string[] | any[];
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  emergency_notes?: string | null;
  avatar_url?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  blood_group?: BloodGroup | null;
  medical_conditions?: string[] | any[];
  allergies?: string[] | any[];
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  emergency_notes?: string | null;
  avatar_url?: string | null;
}

export interface ListUsersFilter {
  role?: string;
  limit?: number;
  offset?: number;
}

export class UserModel {
  static async create(input: CreateUserInput): Promise<User> {
    const text = `
      INSERT INTO users (
        name, email, phone, role, blood_group, medical_conditions, allergies,
        address, city, country, timezone, emergency_notes, avatar_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const params = [
      input.name,
      input.email,
      input.phone || null,
      input.role || 'parent',
      input.blood_group || null,
      JSON.stringify(input.medical_conditions || []),
      JSON.stringify(input.allergies || []),
      input.address || null,
      input.city || null,
      input.country || 'India',
      input.timezone || 'Asia/Kolkata',
      input.emergency_notes || null,
      input.avatar_url || null,
    ];

    const result = await query<User>(text, params);
    return result.rows[0];
  }

  static async findById(id: string): Promise<User | null> {
    const text = 'SELECT * FROM users WHERE id = $1';
    const result = await query<User>(text, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const text = 'SELECT * FROM users WHERE email = $1';
    const result = await query<User>(text, [email]);
    return result.rows[0] || null;
  }

  static async list(filter: ListUsersFilter = {}): Promise<{ users: User[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(filter.role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const countRes = await query<{ total: string }>(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // Data query
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 50;
    const offset = filter.offset && filter.offset >= 0 ? filter.offset : 0;

    const dataSql = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataParams = [...params, limit, offset];

    const dataRes = await query<User>(dataSql, dataParams);
    return { users: dataRes.rows, total };
  }

  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(input.name);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      params.push(input.email);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      params.push(input.phone);
    }
    if (input.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      params.push(input.role);
    }
    if (input.blood_group !== undefined) {
      fields.push(`blood_group = $${paramIndex++}`);
      params.push(input.blood_group);
    }
    if (input.medical_conditions !== undefined) {
      fields.push(`medical_conditions = $${paramIndex++}`);
      params.push(JSON.stringify(input.medical_conditions));
    }
    if (input.allergies !== undefined) {
      fields.push(`allergies = $${paramIndex++}`);
      params.push(JSON.stringify(input.allergies));
    }
    if (input.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      params.push(input.address);
    }
    if (input.city !== undefined) {
      fields.push(`city = $${paramIndex++}`);
      params.push(input.city);
    }
    if (input.country !== undefined) {
      fields.push(`country = $${paramIndex++}`);
      params.push(input.country);
    }
    if (input.timezone !== undefined) {
      fields.push(`timezone = $${paramIndex++}`);
      params.push(input.timezone);
    }
    if (input.emergency_notes !== undefined) {
      fields.push(`emergency_notes = $${paramIndex++}`);
      params.push(input.emergency_notes);
    }
    if (input.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      params.push(input.avatar_url);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query<User>(sql, params);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const text = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await query<{ id: string }>(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
