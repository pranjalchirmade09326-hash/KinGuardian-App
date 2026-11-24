import { FamilyMember } from './family';
import { HealthEvent } from './health';
import { HealthDocument } from './document';

export * from './user';
export * from './family';
export * from './health';
export * from './medication';
export * from './appointment';
export * from './document';
export * from './notification';
export * from './ai';
export * from './care';

// Compatibility aliases
export type Person = FamilyMember;
export type HealthRecordItem = HealthEvent;
export type DocumentItem = HealthDocument;

// Milestone M2 contracts
export type {
  EmergencyContact,
  EmergencyContactCreate,
  EmergencyContactUpdate,
  AlertIncident,
  AlertCreateInput,
  ListAlertsQuery,
  AcknowledgeAlertInput,
  ResolveAlertInput,
  AlertType,
  AlertSeverity,
  AlertStatus,
  ApiResponse,
  UserProfile,
  UserCreateInput,
  UserUpdateInput
} from '../services/api-client/types';
