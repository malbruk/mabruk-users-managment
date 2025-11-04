import { createContext } from 'react';
import { AuthResponse } from '../api/types';

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  refreshToken: null,
  expiresAt: null,
  setSession: () => undefined,
  logout: () => undefined,
  isAuthenticated: false
});
