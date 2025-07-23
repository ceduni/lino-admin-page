import { authenticatedRequest } from './apiUtils.js';

export const adminAPI = {
    searchAdmins: async (q = '', limit = 20, page = 1) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        params.append('limit', limit.toString());
        params.append('page', page.toString());

        const data = await authenticatedRequest(`/search/admins?${params.toString()}`, {
            method: 'GET',
        });
        return {
            admins: data['admins'] || [],
            pagination: data['pagination'] || {
                currentPage: 1,
                totalPages: 1,
                totalResults: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit: 20
            }
        };
    },

    checkAdmin: async () => {
        const data = await authenticatedRequest('/admin/status', {
            method: 'GET',
        });
        return data['isAdmin'];
    },

    addAdmin: async (username) => {
        return await authenticatedRequest('/admin/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
    },

    removeAdmin: async (username) => {
        return await authenticatedRequest('/admin/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
    },

    searchUsers: async (q = '', limit = 20, page = 1) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        params.append('limit', limit.toString());
        params.append('page', page.toString());

        const data = await authenticatedRequest(`/search/users?${params.toString()}`, {
            method: 'GET',
        });
        return {
            users: data['users'] || [],
            pagination: data['pagination'] || {
                currentPage: 1,
                totalPages: 1,
                totalResults: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit: 20
            }
        };
    },
};
