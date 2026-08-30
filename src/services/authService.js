import { API_CONFIG } from '../config/api';
import { fetchWithTimeout } from './apiClient';

const TOKEN_KEY = 'codemate_jwt_token';
const USER_KEY = 'codemate_user_data';
const REMEMBERED_GOOGLE_ACCOUNTS_KEY = 'codemate_remembered_google_accounts';

export const authService = {
  /**
   * Get previously authenticated Google accounts stored on this device
   */
  getRememberedGoogleAccounts() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(REMEMBERED_GOOGLE_ACCOUNTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    // First-time users have no stored accounts on this device
    return [];
  },

  /**
   * Save a successfully authenticated Google account to the remembered list
   */
  saveRememberedGoogleAccount(account) {
    if (typeof window === 'undefined' || !account || !account.email) return;
    try {
      const existing = this.getRememberedGoogleAccounts().filter(
        a => a.email.toLowerCase() !== account.email.toLowerCase()
      );
      const updated = [
        {
          email: account.email.toLowerCase(),
          name: account.name || account.email.split('@')[0],
          avatarUrl: account.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(account.email)}`,
          lastUsed: 'Recently authenticated'
        },
        ...existing
      ].slice(0, 5); // Keep up to 5 recent accounts
      localStorage.setItem(REMEMBERED_GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save remembered account', e);
    }
  },

  /**
   * Remove a remembered Google account
   */
  removeRememberedGoogleAccount(email) {
    if (typeof window === 'undefined' || !email) return;
    try {
      const existing = this.getRememberedGoogleAccounts().filter(
        a => a.email.toLowerCase() !== email.toLowerCase()
      );
      localStorage.setItem(REMEMBERED_GOOGLE_ACCOUNTS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not remove remembered account', e);
    }
  },

  /**
   * Get URL to initiate official Google OAuth 2.0 / OpenID Connect authorization
   * Spring Security OAuth2 redirects the browser directly to accounts.google.com
   */
  getGoogleOAuthUrl() {
    return `${API_CONFIG.BASE_URL}/oauth2/authorization/google`;
  },

  /**
   * Get URL to initiate official GitHub OAuth 2.0 authorization
   * Spring Security OAuth2 redirects the browser directly to github.com/login/oauth/authorize
   */
  getGithubOAuthUrl() {
    return `${API_CONFIG.BASE_URL}/oauth2/authorization/github`;
  },

  /**
   * Get currently stored JWT token
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Store JWT token
   */
  setToken(token) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Get cached user profile
   */
  getCachedUser() {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Save cached user profile
   */
  setCachedUser(user) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Register a new user with Email and Password
   */
  async register(name, email, password) {
    const data = await fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data && data.token) {
      this.setToken(data.token);
      this.setCachedUser(data.user);
    }

    return data;
  },

  /**
   * Log in with Email and Password
   */
  async login(email, password) {
    const data = await fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data && data.token) {
      this.setToken(data.token);
      this.setCachedUser(data.user);
    }

    return data;
  },

  /**
   * Sign in / Register with Google OAuth
   */
  async loginWithGoogle(credential, hints = {}) {
    const data = await fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_GOOGLE, {
      method: 'POST',
      body: JSON.stringify({
        credential,
        email: hints.email,
        name: hints.name,
        avatarUrl: hints.avatarUrl,
      }),
    });

    if (data && data.token) {
      this.setToken(data.token);
      this.setCachedUser(data.user);
      if (data.user) {
        this.saveRememberedGoogleAccount(data.user);
      }
    }

    return data;
  },

  /**
   * Fetch current authenticated user profile (/api/auth/me)
   */
  async getMe() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = await fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_ME, {
      method: 'GET',
    });

    this.setCachedUser(user);
    return user;
  },

  /**
   * Update user profile (name, bio, avatarUrl, coverUrl)
   */
  async updateProfile({ name, bio, avatarUrl, coverUrl }) {
    const data = await fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_PROFILE, {
      method: 'PUT',
      body: JSON.stringify({ name, bio, avatarUrl, coverUrl }),
    });

    const updatedUser = data?.user || data;
    if (updatedUser) {
      this.setCachedUser(updatedUser);
    }
    return updatedUser;
  },

  /**
   * Log out and clear tokens
   */
  logout() {
    this.setToken(null);
    this.setCachedUser(null);
  },

  /**
   * Check if user has an active token
   */
  isAuthenticated() {
    return Boolean(this.getToken());
  },

  /**
   * Try loading authenticated session if a valid token exists
   */
  async tryRestoreSession() {
    if (this.isAuthenticated()) {
      try {
        const user = await this.getMe();
        return user;
      } catch (err) {
        console.warn('Existing token invalid, clearing session:', err);
        this.logout();
        return null;
      }
    }
    return null;
  },
};
