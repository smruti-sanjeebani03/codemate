import { API_CONFIG } from '../config/api';
import { fetchWithTimeout } from './apiClient';
import { HealthResponse } from '../types';

export const healthService = {
  /**
   * Checks the health endpoint of the backend service.
   * Target endpoint: GET /api/health
   */
  async checkHealth(): Promise<HealthResponse> {
    return await fetchWithTimeout<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  },

  /**
   * Returns current configured API base URL and target endpoint for diagnostics
   */
  getConfiguredEndpoint(): string {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`;
  },
};
