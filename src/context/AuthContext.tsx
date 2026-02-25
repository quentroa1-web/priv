import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, register as registerApi, getMe, updateProfile, heartbeat as heartbeatApi } from '../services/api';

import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAnnouncer: boolean;
  isLoggedIn: boolean;
  updateUser: (updates: Partial<any>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Verify token is still valid
      getMe().then((res: any) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }).catch(() => logout());
    }
    setIsLoading(false);

    // Heartbeat to update online status
    const heartbeat = setInterval(() => {
      if (localStorage.getItem('token')) {
        heartbeatApi().catch(() => { });
      }
    }, 2 * 60 * 1000); // Pulse every 2 minutes

    return () => clearInterval(heartbeat);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (userData: any) => {
    const response = await registerApi(userData);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (updates: Partial<any>) => {
    if (user) {
      try {
        const response = await updateProfile(updates);
        if (response.data.success) {
          const updatedUser = { ...user, ...response.data.user };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        // Silent fail to reduce console noise
        throw error;
      }
    }
  };

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('token')) {
        const res = await getMe();
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  useEffect(() => {
    let interval: any;

    if (!!user) {
      // Refresh immediately when user returns to the tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshUser();
          // Resume polling
          if (!interval) {
            interval = setInterval(refreshUser, 15000);
          }
        } else {
          // Pause polling to save resources
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Start initial interval if visible
      if (document.visibilityState === 'visible') {
        interval = setInterval(refreshUser, 15000);
      }

      return () => {
        if (interval) clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [!!user]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isAnnouncer: user?.role === 'announcer' || user?.role === 'admin',
    isLoggedIn: !!user,
    updateUser,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
