'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/services/api';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; username: string; display_name: string; role: UserRole }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: { display_name?: string; bio?: string; phone?: string; address?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('gg_token');
    if (token) {
      authApi.getMe()
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          localStorage.removeItem('gg_token');
          localStorage.removeItem('gg_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({ email, password });
    const { session } = res.data.data;

    localStorage.setItem('gg_token', session.access_token);
    localStorage.setItem('gg_refresh_token', session.refresh_token);

    // Fetch full profile
    const profileRes = await authApi.getMe();
    const fullUser = profileRes.data.data;
    setUser(fullUser);
    return fullUser;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; username: string; display_name: string; role: UserRole }): Promise<User> => {
    const res = await authApi.register(data);
    const responseData = res.data.data;

    if (responseData.session) {
      localStorage.setItem('gg_token', responseData.session.access_token);
      localStorage.setItem('gg_refresh_token', responseData.session.refresh_token);

      const profileRes = await authApi.getMe();
      const fullUser = profileRes.data.data;
      setUser(fullUser);
      return fullUser;
    }
    throw new Error('Registration succeeded but no session was returned');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('gg_token');
    localStorage.removeItem('gg_refresh_token');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: { display_name?: string; bio?: string; phone?: string; address?: string }) => {
    const res = await authApi.updateMe(data);
    setUser(res.data.data);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
