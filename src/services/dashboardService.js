import { fetchWithTimeout } from './apiClient';

/**
 * Dashboard & Statistics Service
 * Interacts with /api/dashboard, /api/statistics, and /api/settings/daily-target
 */
export const dashboardService = {
  /**
   * Fetch aggregate dashboard data (summary, today progress, streak, recent problems, activity, distributions)
   */
  async getDashboard() {
    return await fetchWithTimeout('/api/dashboard', {
      method: 'GET',
    });
  },

  /**
   * Fetch detailed breakdown statistics
   */
  async getStatistics() {
    return await fetchWithTimeout('/api/statistics', {
      method: 'GET',
    });
  },

  /**
   * Fetch user's configured daily target
   */
  async getDailyTarget() {
    return await fetchWithTimeout('/api/settings/daily-target', {
      method: 'GET',
    });
  },

  /**
   * Update user's daily coding problem target
   * @param {number} dailyTarget - Integer between 1 and 100
   */
  async updateDailyTarget(dailyTarget) {
    return await fetchWithTimeout('/api/settings/daily-target', {
      method: 'PUT',
      body: JSON.stringify({ dailyTarget: Number(dailyTarget) }),
    });
  },
};
