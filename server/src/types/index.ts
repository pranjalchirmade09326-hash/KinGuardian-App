export type UserRole = 'coordinator' | 'parent' | 'caregiver' | 'doctor';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'Unknown';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  blood_group?: BloodGroup | null;
  medical_conditions: string[] | any[];
  allergies: string[] | any[];
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  emergency_notes?: string | null;
  avatar_url?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string | null;
  is_primary: boolean;
  priority: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export type AlertType =
  | 'fall_detected'
  | 'fall_detection'
  | 'sos'
  | 'sos_panic'
  | 'vital_spike'
  | 'bp_spike'
  | 'unwell_checkin'
  | 'heart_rate_abnormal'
  | 'medication_missed'
  | 'geofence_exit'
  | 'general_emergency';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AlertStatus =
  | 'triggered'
  | 'acknowledged'
  | 'dispatched'
  | 'resolved'
  | 'false_alarm';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  location_coords?: LocationCoords | null;
  location_name?: string | null;
  description: string;
  metadata: Record<string, any>;
  triggered_at: Date | string;
  acknowledged_at?: Date | string | null;
  acknowledged_by?: string | null;
  resolved_at?: Date | string | null;
  resolution_notes?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
    request_id?: string;
    details?: any;
  };
}
