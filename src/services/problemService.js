import { fetchWithTimeout } from './apiClient';

/**
 * Frontend Problem Management Service
 * Communicates with the Spring Boot / Express REST endpoints at /api/problems
 */
export const problemService = {
  /**
   * Fetch problems for the authenticated user with optional filtering and sorting.
   */
  async getProblems(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.topic && filters.topic !== 'ALL') params.append('topic', filters.topic);
    if (filters.difficulty && filters.difficulty !== 'ALL') params.append('difficulty', filters.difficulty);
    if (filters.platform && filters.platform !== 'ALL') params.append('platform', filters.platform);
    if (filters.language && filters.language !== 'ALL') params.append('language', filters.language);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await fetchWithTimeout(`/api/problems${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Fetch a single problem by ID.
   */
  async getProblemById(id) {
    return await fetchWithTimeout(`/api/problems/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Record a new solved problem.
   */
  async createProblem(problemData) {
    return await fetchWithTimeout('/api/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  },

  /**
   * Update an existing problem.
   */
  async updateProblem(id, problemData) {
    return await fetchWithTimeout(`/api/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    });
  },

  /**
   * Delete a problem by ID.
   */
  async deleteProblem(id) {
    return await fetchWithTimeout(`/api/problems/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Live platform preview analysis for a URL without scraping.
   */
  async detectPlatform(url) {
    return await fetchWithTimeout('/api/problems/detect-platform', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
};
