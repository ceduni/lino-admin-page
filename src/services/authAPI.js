import { API_BASE_URL } from './constants.js';
import { tokenService } from './tokenService.js';

export const authAPI = {
  login: async (identifier, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  register: async (username, email, password, adminVerificationKey, { phone } = {}) => {
    const body = {
      username,
      email,
      password,
      adminVerificationKey,
    };
    if (phone) {
      body.phone = phone;
    }

    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  verifyAdminKey: async (adminVerificationKey) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        adminVerificationKey,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.error || 'Admin verification failed');
    }

    return data;
  }
};
