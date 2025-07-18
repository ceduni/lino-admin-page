import { API_BASE_URL } from './constants.js';
import { tokenService } from './tokenService.js';

export const bookboxesAPI = {
  createBookBox: async ({ name, image, longitude, latitude, infoText }) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // If image is a URL string (from ImgBB), send as JSON
    // If image is a File object, send as FormData
    if (typeof image === 'string') {
      const response = await fetch(`${API_BASE_URL}/admin/bookboxes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image,
          longitude,
          latitude,
          infoText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create book box');
      }

      return data;
    } else {
      // Handle File object with FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', image);
      formData.append('longitude', longitude);
      formData.append('latitude', latitude);
      formData.append('infoText', infoText);

      const response = await fetch(`${API_BASE_URL}/admin/bookboxes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create book box');
      }

      return data;
    }
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
      throw new Error(data.error || 'Failed to fetch book box');
    }

    return data;
  },

  deleteBookBox: async (id) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete book box');
    }

    return { message: 'Book box deleted successfully' };
  },

  updateBookBox: async (id, { name, image, longitude, latitude, infoText }) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // If image is a URL string (from ImgBB), send as JSON
    // If image is a File object, send as FormData
    if (typeof image === 'string') {
      const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image,
          longitude,
          latitude,
          infoText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update book box');
      }

      return data;
    } else {
      // Handle File object with FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', image);
      formData.append('longitude', longitude);
      formData.append('latitude', latitude);
      formData.append('infoText', infoText);

      const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update book box');
      }

      return data;
    }
  },

  searchBookBoxes: async (filters = {}) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.cls) queryParams.append('cls', filters.cls);
    if (filters.asc) queryParams.append('asc', filters.asc);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/bookboxes/search${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch book boxes');
    }

    return data;
  },

  deactivateBookBox: async (id) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to deactivate book box');
    }

    return data;
  },

  activateBookBox: async (id) => {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}/activate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to activate book box');
    }

    return data;
  },

  transferBookBoxOwnership: async (id, newOwnerUsername) => {   
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/bookboxes/${id}/transfer`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newOwner: newOwnerUsername }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to transfer book box ownership');
    }

    return data;
  }
};
