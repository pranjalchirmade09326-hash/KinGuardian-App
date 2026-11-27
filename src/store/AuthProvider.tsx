import { useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { AuthUser, SignUpPayload, UpdateProfilePayload, UserRole } from '../types/auth';
import { apiClient } from '../services/api-client/client';

const STORAGE_KEY_AUTH_USER = '@kinguardian_auth_user';
const STORAGE_KEY_REGISTERED_USERS = '@kinguardian_registered_users';

export const ANJALI_USER_ID = '11111111-1111-4111-8111-111111111111';
export const RAMESH_USER_ID = '22222222-2222-4222-8222-222222222222';

interface RegisteredAccount extends AuthUser {
  password?: string;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DEMO_ACCOUNTS: RegisteredAccount[] = [
  {
    id: ANJALI_USER_ID,
    name: 'Anjali Sharma',
    email: 'anjali@kinguardian.com',
    password: 'password123',
    role: 'coordinator',
    city: 'London',
    country: 'United Kingdom',
    phone: '447123456789',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    emergency_notes: 'Primary diaspora caregiver coordinator for parents in Chennai.'
  },
  {
    id: RAMESH_USER_ID,
    name: 'Ramesh Sharma',
    email: 'ramesh@kinguardian.com',
    password: 'password123',
    role: 'parent',
    city: 'Chennai',
    country: 'India',
    phone: '919270756299',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    blood_group: 'B+',
    emergency_notes: 'Hypertension history; on Amlodipine 5mg and Atorvastatin 20mg.'
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredAccount[]>(DEMO_ACCOUNTS);

  // Hydrate auth session on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const [savedUserJson, savedAccountsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_AUTH_USER),
          AsyncStorage.getItem(STORAGE_KEY_REGISTERED_USERS)
        ]);

        let accounts = DEMO_ACCOUNTS;
        if (savedAccountsJson) {
          try {
            const parsed = JSON.parse(savedAccountsJson) as RegisteredAccount[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              accounts = parsed;
              setRegisteredUsers(parsed);
            }
          } catch {
            // Keep default DEMO_ACCOUNTS if parse fails
          }
        }

        if (savedUserJson) {
          const parsedUser = JSON.parse(savedUserJson) as AuthUser;
          // Normalize legacy IDs to UUIDs if needed
          if (parsedUser.id === 'anjali') parsedUser.id = ANJALI_USER_ID;
          if (parsedUser.id === 'ramesh') parsedUser.id = RAMESH_USER_ID;

          const accountMatch = accounts.find(
            (a) => a.email.toLowerCase() === parsedUser.email.toLowerCase()
          );

          if (accountMatch) {
            setUser(parsedUser);
            setIsAuthenticated(true);

            // Attempt background sync with backend PostgreSQL
            apiClient.users
              .get(parsedUser.id)
              .then((res) => {
                if (res && res.data) {
                  const be = res.data;
                  const syncedUser: AuthUser = {
                    ...parsedUser,
                    name: be.name || parsedUser.name,
                    phone: be.phone || parsedUser.phone,
                    city: be.city || parsedUser.city,
                    country: be.country || parsedUser.country,
                    emergency_notes: be.emergency_notes || parsedUser.emergency_notes,
                    blood_group: be.blood_group || parsedUser.blood_group,
                    medical_conditions: be.medical_conditions || parsedUser.medical_conditions,
                    allergies: be.allergies || parsedUser.allergies,
                    avatarUrl: be.avatar_url || parsedUser.avatarUrl
                  };
                  setUser(syncedUser);
                  AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(syncedUser));
                }
              })
              .catch((e) => {
                // Silently fallback to cached session if backend is offline
                console.warn('AuthProvider: Background user sync offline fallback:', e.message);
              });
          } else {
            // Clean up stale session
            await AsyncStorage.removeItem(STORAGE_KEY_AUTH_USER);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('Failed to hydrate auth session from AsyncStorage:', err);
        try {
          await AsyncStorage.removeItem(STORAGE_KEY_AUTH_USER);
        } catch {
          // Ignore removal errors
        }
      } finally {
        setIsLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
      setIsLoading(true);
      setError(null);

      const normalizedEmail = email.trim().toLowerCase();
      const account = registeredUsers.find(
        (acc: RegisteredAccount) => acc.email.toLowerCase() === normalizedEmail
      );

      if (!account || (account.password && account.password !== password)) {
        const errorMsg = 'Invalid email or password';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      // Normalize ID to UUID
      let userId = account.id;
      if (userId === 'anjali') userId = ANJALI_USER_ID;
      if (userId === 'ramesh') userId = RAMESH_USER_ID;

      let authUser: AuthUser = {
        id: userId,
        name: account.name,
        email: account.email,
        role: account.role,
        city: account.city,
        country: account.country,
        phone: account.phone,
        avatarUrl: account.avatarUrl,
        blood_group: account.blood_group,
        emergency_notes: account.emergency_notes
      };

      // Try fetching latest profile from backend if available
      try {
        const res = await apiClient.users.get(userId);
        if (res && res.data) {
          const be = res.data;
          authUser = {
            ...authUser,
            name: be.name || authUser.name,
            phone: be.phone || authUser.phone,
            city: be.city || authUser.city,
            country: be.country || authUser.country,
            emergency_notes: be.emergency_notes || authUser.emergency_notes,
            blood_group: be.blood_group || authUser.blood_group,
            medical_conditions: be.medical_conditions || authUser.medical_conditions,
            allergies: be.allergies || authUser.allergies,
            avatarUrl: be.avatar_url || authUser.avatarUrl
          };
        }
      } catch {
        // Fall back to stored offline credentials
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
        setUser(authUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: authUser };
      } catch {
        const errorMsg = 'Failed to persist session';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    [registeredUsers]
  );

  const signUp = useCallback(
    async (payload: SignUpPayload): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);

      if (payload.role !== 'coordinator' && payload.role !== 'parent') {
        const errorMsg = 'Invalid role specified';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      const normalizedEmail = payload.email.trim().toLowerCase();
      const existing = registeredUsers.find(
        (acc: RegisteredAccount) => acc.email.toLowerCase() === normalizedEmail
      );

      if (existing) {
        const errorMsg = 'An account with this email already exists';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }

      let newId = generateUUID();
      try {
        const res = await apiClient.users.create({
          name: payload.name.trim(),
          email: normalizedEmail,
          role: payload.role,
          city: payload.city.trim(),
          country: payload.country.trim(),
          phone: payload.phone?.trim() || null,
          blood_group: (payload.blood_group as any) || null,
          emergency_notes: payload.emergency_notes || null
        });
        if (res && res.data?.id) {
          newId = res.data.id;
        }
      } catch (apiErr) {
        console.warn(
          'AuthProvider: Backend user creation failed, falling back to local registration:',
          apiErr
        );
      }

      const newAccount: RegisteredAccount = {
        id: newId,
        name: payload.name.trim(),
        email: normalizedEmail,
        password: payload.password,
        role: payload.role,
        city: payload.city.trim(),
        country: payload.country.trim(),
        phone: payload.phone?.trim(),
        blood_group: payload.blood_group,
        emergency_notes: payload.emergency_notes
      };

      const updatedAccounts = [...registeredUsers, newAccount];

      const authUser: AuthUser = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        city: newAccount.city,
        country: newAccount.country,
        phone: newAccount.phone,
        blood_group: newAccount.blood_group,
        emergency_notes: newAccount.emergency_notes
      };

      try {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updatedAccounts)),
          AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser))
        ]);

        setRegisteredUsers(updatedAccounts);
        setUser(authUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      } catch {
        const errorMsg = 'Failed to create account in local storage';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    [registeredUsers]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch (err) {
      console.warn('Failed to remove auth user from AsyncStorage:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const quickSignIn = useCallback(
    async (role: UserRole): Promise<void> => {
      const demoAccount = DEMO_ACCOUNTS.find((a) => a.role === role);
      if (demoAccount) {
        await signIn(demoAccount.email, demoAccount.password || 'password123');
      }
    },
    [signIn]
  );

  const updateProfile = useCallback(
    async (
      payload: UpdateProfilePayload
    ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No active session found.' };
      }

      setIsLoading(true);
      setError(null);

      const updatedUser: AuthUser = {
        ...user,
        name: payload.name !== undefined ? payload.name : user.name,
        phone: payload.phone !== undefined ? payload.phone : user.phone,
        city: payload.city !== undefined ? payload.city : user.city,
        country: payload.country !== undefined ? payload.country : user.country,
        timezone: payload.timezone !== undefined ? payload.timezone : user.timezone,
        emergency_notes:
          payload.emergency_notes !== undefined ? payload.emergency_notes : user.emergency_notes,
        blood_group: payload.blood_group !== undefined ? payload.blood_group : user.blood_group,
        medical_conditions:
          payload.medical_conditions !== undefined
            ? payload.medical_conditions
            : user.medical_conditions,
        allergies: payload.allergies !== undefined ? payload.allergies : user.allergies,
        avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : user.avatarUrl,
        address: payload.address !== undefined ? payload.address : user.address
      };

      // 1. Synchronize to backend REST API
      try {
        const res = await apiClient.users.update(user.id, {
          name: updatedUser.name,
          phone: updatedUser.phone,
          city: updatedUser.city,
          country: updatedUser.country,
          timezone: updatedUser.timezone,
          emergency_notes: updatedUser.emergency_notes,
          blood_group: (updatedUser.blood_group as any) || undefined,
          medical_conditions: updatedUser.medical_conditions,
          allergies: updatedUser.allergies,
          address: updatedUser.address,
          avatar_url: updatedUser.avatarUrl
        });

        if (res && res.data) {
          const be = res.data;
          updatedUser.name = be.name || updatedUser.name;
          updatedUser.phone = be.phone || updatedUser.phone;
          updatedUser.city = be.city || updatedUser.city;
          updatedUser.country = be.country || updatedUser.country;
          updatedUser.emergency_notes = be.emergency_notes || updatedUser.emergency_notes;
          updatedUser.blood_group = be.blood_group || updatedUser.blood_group;
          updatedUser.medical_conditions = be.medical_conditions || updatedUser.medical_conditions;
          updatedUser.allergies = be.allergies || updatedUser.allergies;
          updatedUser.avatarUrl = be.avatar_url || updatedUser.avatarUrl;
        }
      } catch (apiErr: any) {
        console.warn(
          'AuthProvider: Backend update failed, using offline cache:',
          apiErr?.message || apiErr
        );
      }

      // 2. Persist to AsyncStorage as offline cache
      try {
        await AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updatedUser));

        const updatedRegistered = registeredUsers.map((u) =>
          u.id === updatedUser.id ? { ...u, ...updatedUser } : u
        );
        setRegisteredUsers(updatedRegistered);
        await AsyncStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updatedRegistered));

        setUser(updatedUser);
        setIsLoading(false);
        return { success: true, user: updatedUser };
      } catch (storageErr) {
        console.warn('AuthProvider: Storage error saving updated profile:', storageErr);
        setUser(updatedUser);
        setIsLoading(false);
        return { success: true, user: updatedUser };
      }
    },
    [user, registeredUsers]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user || !user.id) return;
    try {
      const res = await apiClient.users.get(user.id);
      if (res && res.data) {
        const be = res.data;
        const refreshed: AuthUser = {
          ...user,
          name: be.name || user.name,
          phone: be.phone || user.phone,
          city: be.city || user.city,
          country: be.country || user.country,
          emergency_notes: be.emergency_notes || user.emergency_notes,
          blood_group: be.blood_group || user.blood_group,
          medical_conditions: be.medical_conditions || user.medical_conditions,
          allergies: be.allergies || user.allergies,
          avatarUrl: be.avatar_url || user.avatarUrl
        };
        setUser(refreshed);
        await AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(refreshed));
      }
    } catch (err: any) {
      console.warn('AuthProvider: refreshProfile failed (offline):', err?.message || err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        quickSignIn,
        updateProfile,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
