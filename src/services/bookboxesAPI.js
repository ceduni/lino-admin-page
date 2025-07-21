import { authenticatedRequest } from './apiUtils.js';

export const bookboxesAPI = {
  createBookBox: async ({ name, image, longitude, latitude, infoText }) => {
    return await authenticatedRequest('/admin/bookboxes', {
      method: 'POST',
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
      headers: {
        'Content-Type': undefined, // Remove content-type for DELETE
      },
    });
    return { message: 'Book box deleted successfully' };
  },

  updateBookBox: async (id, { name, image, longitude, latitude, infoText }) => {
    return await authenticatedRequest(`/admin/bookboxes/${id}`, {
      method: 'PUT',
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
      headers: {
        'Content-Type': undefined, // Remove content-type for GET with no body
      },
    });
  },

  deactivateBookBox: async (id) => {
    return await authenticatedRequest(`/admin/bookboxes/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': undefined, // Remove content-type for PATCH with no body
      },
    });
  },

  activateBookBox: async (id) => { 
    return await authenticatedRequest(`/admin/bookboxes/${id}/activate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': undefined, // Remove content-type for PATCH with no body
      },
    });
  },

  transferBookBoxOwnership: async (id, newOwnerUsername) => {   
    return await authenticatedRequest(`/admin/bookboxes/${id}/transfer`, {
      method: 'PATCH',
      body: JSON.stringify({ newOwner: newOwnerUsername }),
    });
  }
};
