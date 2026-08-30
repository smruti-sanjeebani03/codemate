/**
 * Centralized API Configuration for CodeMate.
 * 
 * Supports dynamic configuration via environment variables (VITE_API_BASE_URL)
 * for seamless switching between local development (http://localhost:8080 or relative proxy)
 * and production deployments (e.g. Render backend URL).
 */

const getApiBaseUrl = (): string => {
  // 1. Check client-side Vite environment variable (e.g. Render backend URL: https://<backend-name>.onrender.com)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. In browser development preview when VITE_API_BASE_URL is not explicitly configured, fallback to window.location.origin
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return '';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    HEALTH: '/api/health',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_GOOGLE: '/api/auth/google',
    AUTH_ME: '/api/auth/me',
    AUTH_PROFILE: '/api/users/profile',
  },
  TIMEOUT_MS: 8000,
  APP_ENV: import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? 'development' : 'production'),
} as const;

export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};
