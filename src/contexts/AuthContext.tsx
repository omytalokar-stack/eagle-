import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/status`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.isLoggedIn && data?.user) {
          setUser({ ...data.user, isAdmin: Boolean(data.isAdmin) });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        // Force a fresh auth check after logout
        await checkAuth();
        // Redirect to home
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, clear local state
      setUser(null);
      window.location.href = '/';
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Re-check auth when window gains focus (e.g. after OAuth redirect)
  useEffect(() => {
    const handleFocus = () => {
      checkAuth();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Re-check auth when returning from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'failed' || params.get('login') === 'error') {
      setLoading(false);
      setUser(null);
    } else {
      // After OAuth redirect, check auth status
      // Small delay to ensure session cookie is set
      const timer = setTimeout(() => {
        checkAuth();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
