import { v4 as uuidv4 } from 'uuid';
import { User, EmergencyContact, Alert } from '../types';

export class InMemoryDb {
  private static instance: InMemoryDb | null = null;

  users: Map<string, User> = new Map();
  contacts: Map<string, EmergencyContact> = new Map();
  alerts: Map<string, Alert> = new Map();

  static getInstance(): InMemoryDb {
    if (!InMemoryDb.instance) {
      InMemoryDb.instance = new InMemoryDb();
    }
    return InMemoryDb.instance;
  }

  reset() {
    this.users.clear();
    this.contacts.clear();
    this.alerts.clear();
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const trimmed = text.trim();

    // 1. Health check probe
    if (trimmed.includes('SELECT 1')) {
      return { rows: [{ health_check: 1 }], rowCount: 1 };
    }

    // -------------------------------------------------------------------------
    // USERS
    // -------------------------------------------------------------------------
    if (trimmed.startsWith('INSERT INTO users')) {
      const [
        name, email, phone, role, blood_group, medical_conditions, allergies,
        address, city, country, timezone, emergency_notes, avatar_url
      ] = params;

      // Check unique email
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === String(email).toLowerCase()) {
          const err: any = new Error('duplicate key value violates unique constraint "users_email_key"');
          err.code = '23505';
          throw err;
        }
      }

      const id = uuidv4();
      const now = new Date();
      const user: User = {
        id,
        name,
        email,
        phone: phone || null,
        role: role || 'parent',
        blood_group: blood_group || null,
        medical_conditions: typeof medical_conditions === 'string' ? JSON.parse(medical_conditions) : (medical_conditions || []),
        allergies: typeof allergies === 'string' ? JSON.parse(allergies) : (allergies || []),
        address: address || null,
        city: city || null,
        country: country || 'India',
        timezone: timezone || 'Asia/Kolkata',
        emergency_notes: emergency_notes || null,
        avatar_url: avatar_url || null,
        created_at: now,
        updated_at: now,
      };
      this.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }

    if (trimmed.startsWith('SELECT * FROM users WHERE id = $1')) {
      const user = this.users.get(params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (trimmed.startsWith('SELECT * FROM users WHERE email = $1')) {
      const email = String(params[0]).toLowerCase();
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === email) {
          return { rows: [u], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (trimmed.includes('SELECT COUNT(*) AS total FROM users')) {
      let matching = Array.from(this.users.values());
      if (params.length > 0 && typeof params[0] === 'string' && !params[0].startsWith('SELECT')) {
        matching = matching.filter((u) => u.role === params[0]);
      }
      return { rows: [{ total: String(matching.length) }], rowCount: 1 };
    }

    if (trimmed.includes('SELECT * FROM users') && !trimmed.includes('WHERE id = $1') && !trimmed.includes('WHERE email = $1')) {
      let matching = Array.from(this.users.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      if (params.length > 2 && typeof params[0] === 'string') {
        matching = matching.filter((u) => u.role === params[0]);
      }
      return { rows: matching, rowCount: matching.length };
    }

    if (trimmed.startsWith('UPDATE users')) {
      const id = params[params.length - 1];
      const user = this.users.get(id);
      if (!user) return { rows: [], rowCount: 0 };

      // Parse fields from SQL
      const fieldMatches = trimmed.matchAll(/(\w+)\s*=\s*\$(\d+)/g);
      for (const match of fieldMatches) {
        const fieldName = match[1];
        const paramIdx = parseInt(match[2], 10) - 1;
        const val = params[paramIdx];
        if (fieldName === 'name') user.name = val;
        else if (fieldName === 'phone') user.phone = val;
        else if (fieldName === 'role') user.role = val;
        else if (fieldName === 'blood_group') user.blood_group = val;
        else if (fieldName === 'medical_conditions') user.medical_conditions = typeof val === 'string' ? JSON.parse(val) : val;
        else if (fieldName === 'allergies') user.allergies = typeof val === 'string' ? JSON.parse(val) : val;
        else if (fieldName === 'address') user.address = val;
        else if (fieldName === 'city') user.city = val;
        else if (fieldName === 'country') user.country = val;
        else if (fieldName === 'timezone') user.timezone = val;
        else if (fieldName === 'emergency_notes') user.emergency_notes = val;
        else if (fieldName === 'avatar_url') user.avatar_url = val;
      }
      user.updated_at = new Date();
      this.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }

    if (trimmed.startsWith('DELETE FROM users WHERE id = $1')) {
      const id = params[0];
      const existed = this.users.delete(id);
      // Cascade delete associated contacts and alerts
      for (const [cId, contact] of this.contacts.entries()) {
        if (contact.user_id === id) this.contacts.delete(cId);
      }
      for (const [aId, alert] of this.alerts.entries()) {
        if (alert.user_id === id) this.alerts.delete(aId);
      }
      return { rows: existed ? [{ id }] : [], rowCount: existed ? 1 : 0 };
    }

    // -------------------------------------------------------------------------
    // EMERGENCY CONTACTS
    // -------------------------------------------------------------------------
    if (trimmed.startsWith('UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1')) {
      const userId = params[0];
      const excludeId = params[1];
      for (const contact of this.contacts.values()) {
        if (contact.user_id === userId && (!excludeId || contact.id !== excludeId)) {
          contact.is_primary = false;
        }
      }
      return { rows: [], rowCount: 0 };
    }

    if (trimmed.startsWith('INSERT INTO emergency_contacts')) {
      const [user_id, name, relationship, phone, email, is_primary, priority] = params;
      const id = uuidv4();
      const now = new Date();
      const contact: EmergencyContact = {
        id,
        user_id,
        name,
        relationship,
        phone,
        email: email || null,
        is_primary: Boolean(is_primary),
        priority: priority !== undefined && priority !== null ? Number(priority) : 1,
        created_at: now,
        updated_at: now,
      };
      this.contacts.set(id, contact);
      return { rows: [contact], rowCount: 1 };
    }

    if (trimmed.startsWith('SELECT * FROM emergency_contacts WHERE id = $1')) {
      const contact = this.contacts.get(params[0]);
      return { rows: contact ? [contact] : [], rowCount: contact ? 1 : 0 };
    }

    if (trimmed.includes('SELECT * FROM emergency_contacts') && trimmed.includes('WHERE user_id = $1')) {
      const userId = params[0];
      const matching = Array.from(this.contacts.values())
        .filter((c) => c.user_id === userId)
        .sort((a, b) => a.priority - b.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return { rows: matching, rowCount: matching.length };
    }

    if (trimmed.startsWith('UPDATE emergency_contacts')) {
      const id = params[params.length - 1];
      const contact = this.contacts.get(id);
      if (!contact) return { rows: [], rowCount: 0 };

      const fieldMatches = trimmed.matchAll(/(\w+)\s*=\s*\$(\d+)/g);
      for (const match of fieldMatches) {
        const fieldName = match[1];
        const paramIdx = parseInt(match[2], 10) - 1;
        const val = params[paramIdx];
        if (fieldName === 'name') contact.name = val;
        else if (fieldName === 'relationship') contact.relationship = val;
        else if (fieldName === 'phone') contact.phone = val;
        else if (fieldName === 'email') contact.email = val;
        else if (fieldName === 'is_primary') contact.is_primary = Boolean(val);
        else if (fieldName === 'priority') contact.priority = Number(val);
      }
      contact.updated_at = new Date();
      this.contacts.set(id, contact);
      return { rows: [contact], rowCount: 1 };
    }

    if (trimmed.startsWith('DELETE FROM emergency_contacts WHERE id = $1')) {
      const id = params[0];
      const existed = this.contacts.delete(id);
      return { rows: existed ? [{ id }] : [], rowCount: existed ? 1 : 0 };
    }

    // -------------------------------------------------------------------------
    // ALERTS
    // -------------------------------------------------------------------------
    if (trimmed.startsWith('INSERT INTO alerts')) {
      const [user_id, type, severity, status, location_coords, location_name, description, metadata] = params;
      const id = uuidv4();
      const now = new Date();
      const alert: Alert = {
        id,
        user_id,
        type,
        severity: severity || 'medium',
        status: status || 'triggered',
        location_coords: location_coords ? (typeof location_coords === 'string' ? JSON.parse(location_coords) : location_coords) : null,
        location_name: location_name || null,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {},
        triggered_at: now,
        acknowledged_at: null,
        acknowledged_by: null,
        resolved_at: null,
        resolution_notes: null,
        created_at: now,
        updated_at: now,
      };
      this.alerts.set(id, alert);
      return { rows: [alert], rowCount: 1 };
    }

    if (trimmed.startsWith('SELECT * FROM alerts WHERE id = $1')) {
      const alert = this.alerts.get(params[0]);
      return { rows: alert ? [alert] : [], rowCount: alert ? 1 : 0 };
    }

    if (trimmed.includes('SELECT COUNT(*) AS total FROM alerts')) {
      let matching = Array.from(this.alerts.values());
      if (trimmed.includes('user_id = $') && params.length > 0) {
        matching = matching.filter((a) => a.user_id === params[0]);
      }
      return { rows: [{ total: String(matching.length) }], rowCount: 1 };
    }

    if (trimmed.includes('SELECT * FROM alerts') && !trimmed.includes('WHERE id = $1')) {
      let matching = Array.from(this.alerts.values()).sort(
        (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
      );
      if (trimmed.includes('user_id = $') && params[0]) {
        matching = matching.filter((a) => a.user_id === params[0]);
      }
      if (trimmed.includes('status = $') && params[1]) {
        matching = matching.filter((a) => a.status === params[1]);
      }
      return { rows: matching, rowCount: matching.length };
    }

    if (trimmed.includes("status = 'acknowledged'")) {
      const id = params[0];
      const by = params[1];
      const alert = this.alerts.get(id);
      if (!alert) return { rows: [], rowCount: 0 };
      alert.status = 'acknowledged';
      alert.acknowledged_at = new Date();
      alert.acknowledged_by = by;
      alert.updated_at = new Date();
      this.alerts.set(id, alert);
      return { rows: [alert], rowCount: 1 };
    }

    if (trimmed.includes("status = 'resolved'")) {
      const id = params[0];
      const notes = params[1];
      const alert = this.alerts.get(id);
      if (!alert) return { rows: [], rowCount: 0 };
      alert.status = 'resolved';
      alert.resolved_at = new Date();
      alert.resolution_notes = notes;
      alert.updated_at = new Date();
      this.alerts.set(id, alert);
      return { rows: [alert], rowCount: 1 };
    }

    if (trimmed.startsWith('DELETE FROM alerts WHERE id = $1')) {
      const id = params[0];
      const existed = this.alerts.delete(id);
      return { rows: existed ? [{ id }] : [], rowCount: existed ? 1 : 0 };
    }

    return { rows: [], rowCount: 0 };
  }
}
