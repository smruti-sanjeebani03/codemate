import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCachedUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        setLoading(true);

        // Check if redirected from Google OAuth (either in hash or query params)
        if (typeof window !== 'undefined') {
          let tokenFromUrl = null;
          let errorFromUrl = null;

          // 1. Check URL query params
          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.has('token')) {
            tokenFromUrl = searchParams.get('token');
          } else if (searchParams.has('error')) {
            errorFromUrl = searchParams.get('error');
          }

          // 2. Check URL hash (e.g. #auth/callback?token=... or #/auth/callback?token=...)
          if (!tokenFromUrl && !errorFromUrl && window.location.hash) {
            const hash = window.location.hash;
            const queryIndex = hash.indexOf('?');
            if (queryIndex !== -1) {
              const hashParams = new URLSearchParams(hash.substring(queryIndex + 1));
              if (hashParams.has('token')) {
                tokenFromUrl = hashParams.get('token');
              } else if (hashParams.has('error')) {
                errorFromUrl = hashParams.get('error');
              }
            }
          }

          if (errorFromUrl) {
            console.error('OAuth callback error received:', errorFromUrl);
            setError(decodeURIComponent(errorFromUrl));
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname + '#/login');
          } else if (tokenFromUrl) {
            // Save received JWT token from real Google OAuth flow
            authService.setToken(tokenFromUrl);
            setToken(tokenFromUrl);
            // Clean URL hash/params
            window.history.replaceState({}, document.title, window.location.pathname + '#/dashboard');
          }
        }

        if (authService.isAuthenticated()) {
          const profile = await authService.getMe();
          if (isMounted) {
            setUser(profile);
            setToken(authService.getToken());
          }
        } else {
          // If no token exists, user remains unauthenticated so they can choose Get Started / Sign in
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('Auth session invalid or expired:', err);
        if (isMounted) {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login with Email & Password
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register with Name, Email & Password
  const register = useCallback(async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with Google
  const loginWithGoogle = useCallback(async (credential, hints = {}) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.loginWithGoogle(credential, hints);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err) {
      setError(err.message || 'Google authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // Update profile in local state
  const updateLocalUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      authService.setCachedUser(updated);
      return updated;
    });
  }, []);

  // Persist updated profile to server and state
  const updateProfile = useCallback(async (profileData) => {
    setError(null);
    setLoading(true);
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    updateLocalUser,
    updateProfile,
    refreshUser: async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          return profile;
        } catch {
          return null;
        }
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
