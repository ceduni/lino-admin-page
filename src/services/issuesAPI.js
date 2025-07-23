import { authenticatedRequest } from './apiUtils.js';

export const issuesAPI = {
  searchIssues: async (filters = {}) => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.bookboxId) queryParams.append('bookboxId', filters.bookboxId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.oldestFirst) queryParams.append('oldestFirst', filters.oldestFirst);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    const queryString = queryParams.toString();
    const endpoint = `/search/issues${queryString ? `?${queryString}` : ''}`;

    return await authenticatedRequest(endpoint, {
      method: 'GET',
    });
  },

  investigateIssue: async (issueId) => {
    return await authenticatedRequest(`/issues/${issueId}/investigate`, {
      method: 'PUT',
    });
  },

  closeIssue: async (issueId) => {
    return await authenticatedRequest(`/issues/${issueId}/close`, {
      method: 'PUT',
    });
  },

  reopenIssue: async (issueId) => {
    return await authenticatedRequest(`/issues/${issueId}/reopen`, {
      method: 'PUT',
    });
  }
};
