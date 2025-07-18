import { API_BASE_URL } from './constants.js';
import { tokenService } from './tokenService.js';

export const transactionsAPI = {
  searchTransactions: async (filters = {}) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.bookTitle) queryParams.append('bookTitle', filters.bookTitle);
    if (filters.bookboxId) queryParams.append('bookboxId', filters.bookboxId);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/books/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch transactions');
    }

    return data;
  },
};
