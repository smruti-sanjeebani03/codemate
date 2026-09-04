import { API_CONFIG, buildApiUrl } from '../config/api';

export class ApiError extends Error {
  constructor(status, statusText, message, responseBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

/**
 * Clean HTTP client with timeout, JSON parsing, and unified error handling.
 */
export async function fetchWithTimeout(endpoint, options = {}, timeoutMs = API_CONFIG.TIMEOUT_MS) {
  const url = buildApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = typeof window !== 'undefined' ? localStorage.getItem('codemate_jwt_token') : null;
  const authHeaders = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorData?.message || `API request failed with HTTP ${response.status} (${response.statusText})`,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', `Request timed out after ${timeoutMs}ms`);
    }
    const message = error instanceof Error ? error.message : 'Network error occurred';
    throw new ApiError(0, 'Network Error', message);
  }
}
