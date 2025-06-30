const API_BASE_URL = 'https://lino-1.onrender.com';
// const API_BASE_URL = 'http://localhost:3000'; // For local development, change to your local server URL


export const tokenService = {
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};


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
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },
};

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
      throw new Error(data.message || 'Failed to fetch transactions');
    }

    return data;
  },
};

export const bookboxesAPI = {
  createBookBox: async ({ name, image, longitude, latitude, infoText }) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);
    formData.append('longitude', longitude);
    formData.append('latitude', latitude);
    formData.append('infoText', infoText);

    const response = await fetch(`${API_BASE_URL}/bookboxes/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create book box');
    }

    return data;
  },

  getBookBox: async (id) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/bookboxes/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch book box');
    }

    return data;
  }
};
