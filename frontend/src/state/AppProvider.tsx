import { ReactNode, useMemo } from 'react';
import { useAuthStore } from './store';
import { AuthContext } from './AuthContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const authValue = useMemo(
    () => ({
      token,
      refreshToken,
      expiresAt,
      setSession,
      logout: clearSession,
      isAuthenticated: Boolean(token)
    }),
    [token, refreshToken, expiresAt, setSession, clearSession]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};
