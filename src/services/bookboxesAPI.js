import { authenticatedRequest } from './apiUtils.js';

export const bookboxesAPI = {
  createBookBox: async ({ name, image, longitude, latitude, infoText }) => {
    return await authenticatedRequest('/admin/bookboxes', {
      method: 'POST',
      headers: {
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
  },

  getBookBox: async (id) => {
    return await authenticatedRequest(`/bookboxes/${id}`, {
      method: 'GET',
    });
  },

  deleteBookBox: async (id) => {
    await authenticatedRequest(`/admin/bookboxes/${id}`, {
      method: 'DELETE',
    });
    return { message: 'Book box deleted successfully' };
  },

  updateBookBox: async (id, { name, image, longitude, latitude, infoText }) => {
    return await authenticatedRequest(`/admin/bookboxes/${id}`, {
      method: 'PUT',
      headers: {
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
  },

  searchBookBoxes: async (filters = {}) => {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.cls) queryParams.append('cls', filters.cls);
    if (filters.asc) queryParams.append('asc', filters.asc);

    const queryString = queryParams.toString();
    const endpoint = `/search/bookboxes/admin${queryString ? `?${queryString}` : ''}`;

    return await authenticatedRequest(endpoint, {
      method: 'GET',
    });
  },

  deactivateBookBox: async (id) => {
    return await authenticatedRequest(`/admin/bookboxes/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  activateBookBox: async (id) => { 
    return await authenticatedRequest(`/admin/bookboxes/${id}/activate`, {
      method: 'PATCH',
    });
  },

  transferBookBoxOwnership: async (id, newOwnerUsername) => {   
    return await authenticatedRequest(`/admin/bookboxes/${id}/transfer`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newOwner: newOwnerUsername }),
    });
  }
};
