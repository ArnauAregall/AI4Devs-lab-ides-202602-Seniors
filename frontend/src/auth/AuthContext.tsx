import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextValue {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(null);

  const setAccessToken = (token: string) => setToken(token);
  const clearToken = () => setToken(null);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
