import { API_BASE_URL } from './constants.js';
import { tokenService } from './tokenService.js';

/**
 * Makes an authenticated API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
export const authenticatedRequest = async (endpoint, options = {}) => {
  const token = tokenService.getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

/**
 * Makes an unauthenticated API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
export const unauthenticatedRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};
