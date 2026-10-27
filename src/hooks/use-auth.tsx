import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

export const REMEMBERED_SESSION_DURATION_DAYS = 3650;

interface User {
  accountId: string;
  roles: string[];
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  clearSessionToken: () => Promise<void>;
  login: (token: string, remember?: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeToken(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    return {
      accountId: payload.accountId || payload.sub,
      roles: payload.roles || [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('jwt-token') || localStorage.getItem('jwt-token');
    if (token) {
      const userData = decodeToken(token);
      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const clearSessionToken = useCallback(async () => {
    await api.delete('/api/end-session');
    setUser(null);
    sessionStorage.removeItem('jwt-token');
    localStorage.removeItem('jwt-token');
  }, []);

  const login = useCallback((token: string, remember?: boolean) => {
    const userData = decodeToken(token);
    if (userData) {
      setUser(userData);
      if (remember) {
        const d = new Date(Date.now() + REMEMBERED_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `token=${token}; ${expires}`;
        localStorage.setItem('jwt-token', token);
      } else {
        sessionStorage.setItem('jwt-token', token);
        document.cookie = `token=${token}`;
      }
    }
  }, []);

  const value = useMemo(() => ({ user, loading, clearSessionToken, login }), [user, loading, clearSessionToken, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
