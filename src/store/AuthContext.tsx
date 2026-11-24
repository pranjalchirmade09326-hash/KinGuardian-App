import { createContext } from 'react';
import { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// React 19 reconciler compatibility: Context can act directly as Provider
(AuthContext as any).Provider = AuthContext;

