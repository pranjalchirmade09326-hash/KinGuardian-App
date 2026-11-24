import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import app from '../src/app';
import { setPool, checkHealth, closePool } from '../src/db/pool';

let testServer: http.Server | null = null;
let testSocketPath: string = '';

class TestResponse {
  status: number;
  body: any;
  headers: Record<string, string>;

  constructor(status: number, body: any, headers: Record<string, string>) {
    this.status = status;
    this.body = body;
    this.headers = headers;
  }
}

class TestRequestBuilder implements PromiseLike<TestResponse> {
  private method: string;
  private path: string;
  private headers: Record<string, string> = {};
  private data: any = undefined;

  constructor(method: string, path: string) {
    this.method = method;
    this.path = path;
  }

  set(header: string, value: string): this {
    this.headers[header] = value;
    return this;
  }

  send(body: any): this {
    this.data = body;
    return this;
  }

  then<TResult1 = TestResponse, TResult2 = never>(
    onfulfilled?: ((value: TestResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private execute(): Promise<TestResponse> {
    return new Promise((resolve, reject) => {
      let payload: string | undefined;
      const reqHeaders = { ...this.headers };

      if (this.data !== undefined) {
        payload = typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
        if (!reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
          reqHeaders['Content-Type'] = 'application/json';
        }
        reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
      }

      const req = http.request(
        {
          socketPath: testSocketPath,
          path: this.path,
          method: this.method,
          headers: reqHeaders,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            let parsed: any = {};
            if (raw.length > 0) {
              try {
                parsed = JSON.parse(raw);
              } catch {
                parsed = raw;
              }
            }
            resolve(new TestResponse(res.statusCode || 500, parsed, res.headers as Record<string, string>));
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }
}

function request(_appInstance: any) {
  return {
    get: (path: string) => new TestRequestBuilder('GET', path),
    post: (path: string) => new TestRequestBuilder('POST', path),
    patch: (path: string) => new TestRequestBuilder('PATCH', path),
    delete: (path: string) => new TestRequestBuilder('DELETE', path),
    put: (path: string) => new TestRequestBuilder('PUT', path),
  };
}

/**
 * Genuine In-Memory SQL database state for isolated unit/integration tests
 * when PostgreSQL server is not running locally.
 */
class InMemoryDb {
  users: Map<string, any> = new Map();
  contacts: Map<string, any> = new Map();
  alerts: Map<string, any> = new Map();

  reset() {
    this.users.clear();
    this.contacts.clear();
    this.alerts.clear();
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const trimmed = text.trim();

    // Health check
    if (trimmed.includes('SELECT 1')) {
      return { rows: [{ health_check: 1 }], rowCount: 1 };
    }

    // --- USERS ---
    if (trimmed.startsWith('INSERT INTO users')) {
      const [
        name, email, phone, role, blood_group, medical_conditions, allergies,
        address, city, country, timezone, emergency_notes, avatar_url
      ] = params;

      const id = uuidv4();
      const now = new Date();
      const user = {
        id,
        name,
        email,
        phone,
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
      const email = params[0];
      for (const u of this.users.values()) {
        if (u.email === email) {
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
      if (trimmed.includes('name =')) {
        const idx = parseInt(trimmed.match(/name = \$(\d+)/)?.[1] || '0') - 1;
        user.name = params[idx];
      }
      if (trimmed.includes('medical_conditions =')) {
        const idx = parseInt(trimmed.match(/medical_conditions = \$(\d+)/)?.[1] || '0') - 1;
        user.medical_conditions = typeof params[idx] === 'string' ? JSON.parse(params[idx]) : params[idx];
      }
      if (trimmed.includes('city =')) {
        const idx = parseInt(trimmed.match(/city = \$(\d+)/)?.[1] || '0') - 1;
        user.city = params[idx];
      }
      user.updated_at = new Date();
      this.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }

    if (trimmed.startsWith('DELETE FROM users WHERE id = $1')) {
      const id = params[0];
      const existed = this.users.delete(id);
      // Cascade to contacts and alerts
      for (const [cId, contact] of this.contacts.entries()) {
        if (contact.user_id === id) this.contacts.delete(cId);
      }
      for (const [aId, alert] of this.alerts.entries()) {
        if (alert.user_id === id) this.alerts.delete(aId);
      }
      return { rows: existed ? [{ id }] : [], rowCount: existed ? 1 : 0 };
    }

    // --- EMERGENCY CONTACTS ---
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
      const contact = {
        id,
        user_id,
        name,
        relationship,
        phone,
        email: email || null,
        is_primary: Boolean(is_primary),
        priority: priority || 1,
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

      if (trimmed.includes('phone =')) {
        const idx = parseInt(trimmed.match(/phone = \$(\d+)/)?.[1] || '0') - 1;
        contact.phone = params[idx];
      }
      if (trimmed.includes('priority =')) {
        const idx = parseInt(trimmed.match(/priority = \$(\d+)/)?.[1] || '0') - 1;
        contact.priority = params[idx];
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

    // --- ALERTS ---
    if (trimmed.startsWith('INSERT INTO alerts')) {
      const [user_id, type, severity, status, location_coords, location_name, description, metadata] = params;
      const id = uuidv4();
      const now = new Date();
      const alert = {
        id,
        user_id,
        type,
        severity: severity || 'medium',
        status: status || 'triggered',
        location_coords: location_coords ? JSON.parse(location_coords) : null,
        location_name: location_name || null,
        description,
        metadata: metadata ? JSON.parse(metadata) : {},
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
      return { rows: [{ total: String(matching.length) }], rowCount: 1 };
    }

    if (trimmed.includes('SELECT * FROM alerts') && !trimmed.includes('WHERE id = $1')) {
      let matching = Array.from(this.alerts.values()).sort(
        (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
      );
      if (trimmed.includes('user_id = $1') && params[0]) {
        matching = matching.filter((a) => a.user_id === params[0]);
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

describe('KinGuardian API Integration Test Suite', () => {
  const inMemoryDb = new InMemoryDb();

  beforeAll(async () => {
    testSocketPath =
      process.platform === 'win32'
        ? `\\\\.\\pipe\\kinguardian-test-${process.pid}-${Date.now()}`
        : `/tmp/kinguardian-test-${process.pid}-${Date.now()}.sock`;

    testServer = http.createServer(app);
    await new Promise<void>((resolve, reject) => {
      testServer!.listen(testSocketPath, () => resolve());
      testServer!.on('error', reject);
    });

    // Check if live PostgreSQL is available; if not, inject InMemoryDb mock pool
    const liveHealth = await checkHealth();
    if (!liveHealth.connected) {
      console.log('[Test Setup] PostgreSQL not reachable; using in-memory database mock adapter.');
      const mockPool: any = {
        query: (text: string, params: any[]) => inMemoryDb.query(text, params),
        connect: async () => ({
          query: (text: string, params: any[]) => inMemoryDb.query(text, params),
          release: () => {},
        }),
        on: () => {},
        end: async () => {},
      };
      setPool(mockPool);
    } else {
      console.log('[Test Setup] Live PostgreSQL detected. Running tests against PostgreSQL.');
    }
  });

  afterAll(async () => {
    if (testServer) {
      await new Promise<void>((resolve) => testServer!.close(() => resolve()));
      testServer = null;
    }
    await closePool();
  });

  describe('Health Check Endpoints', () => {
    it('GET /health should return 200 with status ok and uptime', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.uptime).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      expect(['connected', 'disconnected']).toContain(res.body.database);
    });

    it('GET /health/ready should return 200 or 503 depending on database status', async () => {
      const res = await request(app).get('/health/ready');
      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe('ready');
        expect(res.body.database).toBe('connected');
      } else {
        expect(res.body.status).toBe('not_ready');
      }
    });

    it('X-Request-ID header should be populated on all responses', async () => {
      const customId = uuidv4();
      const res = await request(app)
        .get('/health')
        .set('X-Request-ID', customId);
      expect(res.headers['x-request-id']).toBe(customId);
    });
  });

  describe('User Profiles API (/api/v1/users)', () => {
    let createdUserId: string;
    const testEmail = `ramesh_${Date.now()}@kinguardian.test`;

    it('POST /api/v1/users should validate required fields', async () => {
      const res = await request(app).post('/api/v1/users').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/users should create a user successfully', async () => {
      const payload = {
        name: 'Ramesh Sharma',
        email: testEmail,
        phone: '+919876543210',
        role: 'parent',
        blood_group: 'B+',
        medical_conditions: ['Hypertension', 'Type 2 Diabetes'],
        allergies: ['Penicillin'],
        city: 'Chennai',
        country: 'India',
        timezone: 'Asia/Kolkata',
        emergency_notes: 'Prefers Apollo Hospital Greams Road.',
      };

      const res = await request(app).post('/api/v1/users').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('Ramesh Sharma');
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.blood_group).toBe('B+');

      createdUserId = res.body.data.id;
    });

    it('POST /api/v1/users should reject duplicate email with 409 CONFLICT', async () => {
      const payload = {
        name: 'Duplicate Ramesh',
        email: testEmail,
        role: 'parent',
      };
      const res = await request(app).post('/api/v1/users').send(payload);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('GET /api/v1/users/:id should retrieve user by id', async () => {
      const res = await request(app).get(`/api/v1/users/${createdUserId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdUserId);
      expect(res.body.data.city).toBe('Chennai');
    });

    it('GET /api/v1/users/:id should return 400 for non-UUID id', async () => {
      const res = await request(app).get('/api/v1/users/invalid-uuid');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/v1/users/:id should return 404 for unknown UUID', async () => {
      const res = await request(app).get(`/api/v1/users/${uuidv4()}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('GET /api/v1/users should list users', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/v1/users/:id should update user fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${createdUserId}`)
        .send({
          city: 'Bengaluru',
          medical_conditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Arthritis'],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city).toBe('Bengaluru');
    });
  });

  describe('Emergency Contacts API (/api/v1/users/:userId/contacts & /api/v1/contacts)', () => {
    let testUserId: string;
    let contactId1: string;
    let contactId2: string;

    beforeAll(async () => {
      // Create user for contacts
      const res = await request(app).post('/api/v1/users').send({
        name: 'Parent for Contacts',
        email: `parent_contacts_${Date.now()}@kinguardian.test`,
        role: 'parent',
      });
      testUserId = res.body.data.id;
    });

    it('POST /api/v1/users/:userId/contacts should create primary contact', async () => {
      const payload = {
        name: 'Anjali Sharma',
        relationship: 'Daughter',
        phone: '+447911123456',
        email: 'anjali@london.test',
        is_primary: true,
        priority: 1,
      };

      const res = await request(app)
        .post(`/api/v1/users/${testUserId}/contacts`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Anjali Sharma');
      expect(res.body.data.is_primary).toBe(true);
      expect(res.body.data.priority).toBe(1);

      contactId1 = res.body.data.id;
    });

    it('POST /api/v1/users/:userId/contacts should create secondary contact', async () => {
      const payload = {
        name: 'Rahul Sharma',
        relationship: 'Son',
        phone: '+919812345678',
        is_primary: false,
        priority: 2,
      };

      const res = await request(app)
        .post(`/api/v1/users/${testUserId}/contacts`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Rahul Sharma');
      expect(res.body.data.priority).toBe(2);

      contactId2 = res.body.data.id;
    });

    it('GET /api/v1/users/:userId/contacts should return contacts ordered by priority ASC', async () => {
      const res = await request(app).get(`/api/v1/users/${testUserId}/contacts`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].priority).toBe(1);
      expect(res.body.data[1].priority).toBe(2);
    });

    it('GET /api/v1/contacts/:id should retrieve contact details', async () => {
      const res = await request(app).get(`/api/v1/contacts/${contactId1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(contactId1);
      expect(res.body.data.name).toBe('Anjali Sharma');
    });

    it('PATCH /api/v1/contacts/:id should update contact', async () => {
      const res = await request(app)
        .patch(`/api/v1/contacts/${contactId1}`)
        .send({ phone: '+447999888777' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('+447999888777');
    });

    it('DELETE /api/v1/contacts/:id should delete contact', async () => {
      const res = await request(app).delete(`/api/v1/contacts/${contactId2}`);
      expect(res.status).toBe(204);

      const check = await request(app).get(`/api/v1/contacts/${contactId2}`);
      expect(check.status).toBe(404);
    });
  });

  describe('Alerts & Incidents API (/api/v1/alerts)', () => {
    let testUserId: string;
    let alertId: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/users').send({
        name: 'Parent for Alerts',
        email: `parent_alerts_${Date.now()}@kinguardian.test`,
        role: 'parent',
      });
      testUserId = res.body.data.id;
    });

    it('POST /api/v1/alerts should create an emergency incident', async () => {
      const payload = {
        userId: testUserId,
        type: 'sos_panic',
        severity: 'critical',
        description: 'SOS button pressed in bedroom. High heart rate spike detected.',
        location_coords: { latitude: 13.0827, longitude: 80.2707, accuracy: 10 },
        location_name: 'Home - Anna Nagar, Chennai',
        metadata: { heart_rate: 135, bp: '165/105' },
      };

      const res = await request(app).post('/api/v1/alerts').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('triggered');
      expect(res.body.data.severity).toBe('critical');

      alertId = res.body.data.id;
    });

    it('GET /api/v1/alerts should list active alerts', async () => {
      const res = await request(app).get('/api/v1/alerts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((a: any) => a.id === alertId)).toBe(true);
    });

    it('GET /api/v1/alerts/:id should retrieve alert details', async () => {
      const res = await request(app).get(`/api/v1/alerts/${alertId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(alertId);
      expect(res.body.data.type).toBe('sos_panic');
    });

    it('PATCH /api/v1/alerts/:id/acknowledge should transition alert to acknowledged', async () => {
      const res = await request(app)
        .patch(`/api/v1/alerts/${alertId}/acknowledge`)
        .send({ acknowledged_by: 'Anjali (London Coordinator)' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('acknowledged');
      expect(res.body.data.acknowledged_by).toBe('Anjali (London Coordinator)');
      expect(res.body.data.acknowledged_at).toBeDefined();
    });

    it('PATCH /api/v1/alerts/:id/resolve should transition alert to resolved', async () => {
      const res = await request(app)
        .patch(`/api/v1/alerts/${alertId}/resolve`)
        .send({ resolution_notes: 'Spoke via video call. False alarm, phone dropped on floor.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolution_notes).toContain('False alarm');
      expect(res.body.data.resolved_at).toBeDefined();
    });
  });

  describe('Cascade Delete Flow', () => {
    it('Deleting a user should remove the user', async () => {
      const uRes = await request(app).post('/api/v1/users').send({
        name: 'User to Delete',
        email: `delete_${Date.now()}@kinguardian.test`,
        role: 'parent',
      });
      const uId = uRes.body.data.id;

      const delRes = await request(app).delete(`/api/v1/users/${uId}`);
      expect(delRes.status).toBe(204);

      const checkRes = await request(app).get(`/api/v1/users/${uId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
