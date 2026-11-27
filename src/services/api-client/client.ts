/* eslint-disable */
/**
 * DrGodly Typed Mobile API Client.
 * Automatically wraps KinGuardian REST API endpoints with typed contracts,
 * automatic Bearer token injection, correlation tracking, and idempotency support.
 */

import {
  UUID,
  ErrorResponse,
  FamilyMembership,
  CareSubjectResponse,
  MedicationConfirmRequest,
  MedicationAdherenceResponse,
  WellbeingCheckinCreate,
  WellbeingCheckinResponse,
  CareTaskCreate,
  CareTaskResponse,
  ConsentGrantRequest,
  ConsentResponse,
  HealthCheckResponse,
  ApiResponse,
  UserProfile,
  UserCreateInput,
  UserUpdateInput,
  ListUsersQuery,
  EmergencyContact,
  EmergencyContactCreate,
  EmergencyContactUpdate,
  AlertIncident,
  AlertCreateInput,
  ListAlertsQuery,
  AcknowledgeAlertInput,
  ResolveAlertInput
} from './types';
import { CONFIG } from '../../constants/config';

export class DrGodlyApiError extends Error {
  public readonly code: string;
  public readonly requestId: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any> | null;

  constructor(statusCode: number, error: ErrorResponse['error']) {
    super(error.message);
    this.name = 'DrGodlyApiError';
    this.statusCode = statusCode;
    this.code = error.code;
    this.requestId = error.request_id;
    this.details = error.details;
  }
}

export interface ClientConfig {
  baseUrl: string;
  authToken?: string;
  getAuthToken?: () => Promise<string | null>;
  timeoutMs?: number;
}

export class DrGodlyApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private getAuthTokenFn?: () => Promise<string | null>;
  private timeoutMs: number;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.authToken = config.authToken || null;
    this.getAuthTokenFn = config.getAuthToken;
    this.timeoutMs = config.timeoutMs || 15000;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async getActiveToken(): Promise<string | null> {
    if (this.getAuthTokenFn) {
      return await this.getAuthTokenFn();
    }
    return this.authToken;
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      params?: Record<string, string>;
      idempotencyKey?: string;
      customHeaders?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const token = await this.getActiveToken();
    let url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;

    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Request-ID': this.generateUUID(),
      ...options.customHeaders
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json && json.error) {
          throw new DrGodlyApiError(res.status, json.error);
        }
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Domain API Modules

  public readonly system = {
    liveness: () => this.request<HealthCheckResponse>('GET', '/health'),
    readiness: () => this.request<HealthCheckResponse>('GET', '/health/ready')
  };

  public readonly families = {
    getDashboard: (familyId: UUID) =>
      this.request<any>('GET', `/api/v1/families/${familyId}/dashboard`),
    getHome: (familyId: UUID) => this.request<any>('GET', `/api/v1/families/${familyId}/home`),
    listMembers: (familyId: UUID) =>
      this.request<FamilyMembership[]>('GET', `/api/v1/families/${familyId}/members`)
  };

  public readonly subjects = {
    getSummary: (familyId: UUID, subjectId: UUID) =>
      this.request<any>('GET', `/api/v1/families/${familyId}/subjects/${subjectId}/summary`),
    list: (familyId: UUID) =>
      this.request<CareSubjectResponse[]>('GET', `/api/v1/families/${familyId}/subjects`),
    create: (familyId: UUID, data: any, idempotencyKey?: string) =>
      this.request<CareSubjectResponse>('POST', `/api/v1/circles/${familyId}/subjects`, {
        body: data,
        idempotencyKey
      })
  };

  public readonly medications = {
    confirm: (req: MedicationConfirmRequest, idempotencyKey?: string) =>
      this.request<MedicationAdherenceResponse>('POST', '/api/v1/parent/medication/confirm', {
        body: req,
        idempotencyKey
      })
  };

  public readonly checkins = {
    submit: (req: WellbeingCheckinCreate, idempotencyKey?: string) =>
      this.request<WellbeingCheckinResponse>(
        'POST',
        `/api/v1/subjects/${req.subject_id}/check-ins`,
        {
          body: {
            feeling: req.feeling,
            notes: req.notes
          },
          idempotencyKey
        }
      )
  };

  public readonly careTasks = {
    create: (req: CareTaskCreate, idempotencyKey?: string) =>
      this.request<CareTaskResponse>('POST', '/api/v1/care-tasks', {
        body: req,
        idempotencyKey
      }),
    complete: (taskId: UUID, actorId: UUID, idempotencyKey?: string) =>
      this.request<CareTaskResponse>('PATCH', `/api/v1/care-tasks/${taskId}/complete`, {
        body: { actor_id: actorId },
        idempotencyKey
      })
  };

  public readonly consents = {
    grant: (req: ConsentGrantRequest, idempotencyKey?: string) =>
      this.request<ConsentResponse>('POST', '/api/v1/consents', {
        body: req,
        idempotencyKey
      }),
    revoke: (consentId: UUID, idempotencyKey?: string) =>
      this.request<ConsentResponse>('POST', `/api/v1/consents/${consentId}/revoke`, {
        idempotencyKey
      })
  };

  // Milestone M2: Users Profile Endpoints
  public readonly users = {
    get: (id: UUID) => this.request<ApiResponse<UserProfile>>('GET', `/api/v1/users/${id}`),

    update: (id: UUID, data: UserUpdateInput) =>
      this.request<ApiResponse<UserProfile>>('PATCH', `/api/v1/users/${id}`, {
        body: data
      }),

    create: (data: UserCreateInput, idempotencyKey?: string) =>
      this.request<ApiResponse<UserProfile>>('POST', '/api/v1/users', {
        body: data,
        idempotencyKey
      }),

    list: (query?: ListUsersQuery) => {
      const params: Record<string, string> = {};
      if (query) {
        if (query.role) params.role = query.role;
        if (query.limit !== undefined) params.limit = String(query.limit);
        if (query.offset !== undefined) params.offset = String(query.offset);
      }
      return this.request<ApiResponse<UserProfile[]>>('GET', '/api/v1/users', {
        params
      });
    },

    delete: (id: UUID) => this.request<void>('DELETE', `/api/v1/users/${id}`)
  };

  // Milestone M2: Emergency Contacts Endpoints
  public readonly contacts = {
    listByUser: (userId: UUID) =>
      this.request<ApiResponse<EmergencyContact[]>>('GET', `/api/v1/users/${userId}/contacts`),

    create: (userId: UUID, data: EmergencyContactCreate, idempotencyKey?: string) =>
      this.request<ApiResponse<EmergencyContact>>('POST', `/api/v1/users/${userId}/contacts`, {
        body: data,
        idempotencyKey
      }),

    get: (id: UUID) => this.request<ApiResponse<EmergencyContact>>('GET', `/api/v1/contacts/${id}`),

    update: (id: UUID, data: EmergencyContactUpdate) =>
      this.request<ApiResponse<EmergencyContact>>('PATCH', `/api/v1/contacts/${id}`, {
        body: data
      }),

    delete: (id: UUID) => this.request<void>('DELETE', `/api/v1/contacts/${id}`)
  };

  // Milestone M2: Alerts & Incidents Endpoints
  public readonly alerts = {
    list: (query?: ListAlertsQuery) => {
      const params: Record<string, string> = {};
      if (query) {
        if (query.userId) params.userId = query.userId;
        if (query.status) params.status = query.status;
        if (query.severity) params.severity = query.severity;
        if (query.limit !== undefined) params.limit = String(query.limit);
        if (query.offset !== undefined) params.offset = String(query.offset);
      }
      return this.request<ApiResponse<AlertIncident[]>>('GET', '/api/v1/alerts', {
        params
      });
    },

    listForUser: (userId: UUID, query?: Omit<ListAlertsQuery, 'userId'>) => {
      const params: Record<string, string> = {};
      if (query) {
        if (query.status) params.status = query.status;
        if (query.severity) params.severity = query.severity;
        if (query.limit !== undefined) params.limit = String(query.limit);
        if (query.offset !== undefined) params.offset = String(query.offset);
      }
      return this.request<ApiResponse<AlertIncident[]>>('GET', `/api/v1/users/${userId}/alerts`, {
        params
      });
    },

    create: (data: AlertCreateInput, idempotencyKey?: string) =>
      this.request<ApiResponse<AlertIncident>>('POST', '/api/v1/alerts', {
        body: data,
        idempotencyKey
      }),

    get: (id: UUID) => this.request<ApiResponse<AlertIncident>>('GET', `/api/v1/alerts/${id}`),

    acknowledge: (id: UUID, data: AcknowledgeAlertInput) =>
      this.request<ApiResponse<AlertIncident>>('PATCH', `/api/v1/alerts/${id}/acknowledge`, {
        body: data
      }),

    resolve: (id: UUID, data: ResolveAlertInput) =>
      this.request<ApiResponse<AlertIncident>>('PATCH', `/api/v1/alerts/${id}/resolve`, {
        body: data
      }),

    delete: (id: UUID) => this.request<void>('DELETE', `/api/v1/alerts/${id}`)
  };
}

export const apiClient = new DrGodlyApiClient({ baseUrl: CONFIG.apiUrl });
