import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = (token: string, u: User) => {
    localStorage.setItem("vulnlens_token", token);
    localStorage.setItem("vulnlens_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("vulnlens_token");
    localStorage.removeItem("vulnlens_user");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("vulnlens_token");
    const cached = localStorage.getItem("vulnlens_user");
    if (!token) {
      setLoading(false);
      return;
    }
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
    authService
      .getMe()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    persist(res.access_token, res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    persist(res.access_token, res.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
