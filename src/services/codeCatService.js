import { fetchWithTimeout } from './apiClient';

export const codeCatService = {
  /**
   * Get CodeCat AI service status & active model
   */
  async getStatus() {
    return await fetchWithTimeout('/api/codecat/status', { method: 'GET' });
  },

  /**
   * List all conversations belonging to the authenticated user
   */
  async getConversations() {
    return await fetchWithTimeout('/api/codecat/conversations', { method: 'GET' });
  },

  /**
   * Get a single conversation with all messages in chronological order
   */
  async getConversation(id) {
    return await fetchWithTimeout(`/api/codecat/conversations/${id}`, { method: 'GET' });
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(id) {
    return await fetchWithTimeout(`/api/codecat/conversations/${id}`, { method: 'DELETE' });
  },

  /**
   * Send a message to CodeCat
   * @param {Object} payload
   * @param {string} payload.message
   * @param {number|null} [payload.conversationId]
   * @param {Object} [payload.problemContext]
   */
  async sendMessage({ message, conversationId, problemContext }) {
    return await fetchWithTimeout('/api/codecat/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
        problemContext: problemContext || undefined
      })
    });
  }
};
