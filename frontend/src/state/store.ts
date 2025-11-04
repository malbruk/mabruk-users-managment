import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '../api/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiresAt: null,
      setSession: (auth) =>
        set({
          token: auth.token,
          refreshToken: auth.refreshToken,
          expiresAt: auth.expiresAt
        }),
      clearSession: () => set({ token: null, refreshToken: null, expiresAt: null })
    }),
    { name: 'auth-store' }
  )
);

interface DashboardState {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id })
}));
