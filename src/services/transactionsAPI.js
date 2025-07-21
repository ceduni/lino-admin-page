import { authenticatedRequest } from './apiUtils.js';

export const transactionsAPI = {
  searchTransactions: async (filters = {}) => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.bookTitle) queryParams.append('bookTitle', filters.bookTitle);
    if (filters.bookboxId) queryParams.append('bookboxId', filters.bookboxId);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/search/transactions${queryString ? `?${queryString}` : ''}`;

    return await authenticatedRequest(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': undefined, // Remove content-type for GET with no body
      },
    });
  },
};
