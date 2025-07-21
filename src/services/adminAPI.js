import { authenticatedRequest } from './apiUtils.js';

export const adminAPI = {
    getAdmins: async () => {
        const data = await authenticatedRequest('/admin/list', {
            method: 'GET',
        });
        return data['admins'] || [];
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
            body: JSON.stringify({ username }),
        });
    },

    removeAdmin: async (username) => {
        return await authenticatedRequest('/admin/remove', {
            method: 'DELETE',
            body: JSON.stringify({ username }),
        });
    }
};
