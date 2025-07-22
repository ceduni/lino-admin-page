import { authenticatedRequest, unauthenticatedRequest } from './apiUtils.js';

export const authAPI = {
  login: async (identifier, password) => {
    return await unauthenticatedRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password,
      }),
    });
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

    return await unauthenticatedRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  verifyAdminKey: async (adminVerificationKey) => {
    const data = await authenticatedRequest('/admin/set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminVerificationKey,
      }),
    });
    console.log(data);
    return data;
  }
};
