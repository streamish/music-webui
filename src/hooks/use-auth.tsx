import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  accountId: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  clearSessionToken: () => void;
  login: (token: string, remember?: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  clearSessionToken: () => {},
  login: () => {},
});

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

  const clearSessionToken = async () => {
    await api.delete('/api/user/end-session');
    setUser(null);
    sessionStorage.removeItem('jwt-token');
    localStorage.removeItem('jwt-token');
  };

  const login = (token: string, remember?: boolean) => {
    const userData = decodeToken(token);
    if (userData) {
      setUser(userData);
      const d = new Date();
      if (remember) {
        const expiresTime = d.getTime() + 365 * 60 * 60 * 1000;
        d.setTime(expiresTime);
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `token=${token}; ${expires}`;
        localStorage.setItem('jwt-token', token);
      } else {
        const expiresTime = d.getTime() + 60 * 60 * 1000;
        d.setTime(expiresTime);
        sessionStorage.setItem('jwt-token', token);
        document.cookie = `token=${token}`;
      }
    }
  };

  return <AuthContext.Provider value={{ user, loading, clearSessionToken, login }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
