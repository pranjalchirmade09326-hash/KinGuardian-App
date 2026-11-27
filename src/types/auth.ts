export type UserRole = 'coordinator' | 'parent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
  country: string;
  phone?: string;
  avatarUrl?: string;
  blood_group?: string;
  medical_conditions?: string[];
  allergies?: string[];
  address?: string;
  timezone?: string;
  emergency_notes?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  city: string;
  country: string;
  phone?: string;
  blood_group?: string;
  emergency_notes?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  city?: string;
  country?: string;
  timezone?: string;
  emergency_notes?: string;
  blood_group?: string;
  medical_conditions?: string[];
  allergies?: string[];
  avatarUrl?: string;
  address?: string;
}

export interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  signUp: (payload: SignUpPayload) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  quickSignIn: (role: UserRole) => Promise<void>;
  updateProfile: (
    data: UpdateProfilePayload
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}
