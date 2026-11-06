import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile, updateProfile as updateProfileAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cloudcart_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cloudcart_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('cloudcart_token');
      if (savedToken) {
        try {
          const res = await getProfile();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('cloudcart_user', JSON.stringify(res.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('cloudcart_token');
          localStorage.removeItem('cloudcart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      if (data && data.token && data.user) {
        localStorage.setItem('cloudcart_token', data.token);
        localStorage.setItem('cloudcart_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const data = await registerUser({ name, email, password });
      if (data && data.token && data.user) {
        localStorage.setItem('cloudcart_token', data.token);
        localStorage.setItem('cloudcart_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success('Account created successfully! Welcome to CloudCart.');
        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('cloudcart_token');
    localStorage.removeItem('cloudcart_user');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  // Update profile handler
  const updateProfile = async (userData) => {
    try {
      const data = await updateProfileAPI(userData);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem('cloudcart_user', JSON.stringify(data.user));
        toast.success('Profile updated successfully');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
