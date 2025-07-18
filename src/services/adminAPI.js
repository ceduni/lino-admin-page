import { API_BASE_URL } from "./constants";
import { tokenService } from "./tokenService";

export const adminAPI = {
    getAdmins: async () => {
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/admin/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch admins');
        }

        return data;
    },

    checkAdmin: async () => {
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/admin/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to check admin status');
        }

        return data['isAdmin'];
    },

    addAdmin: async (username) => {
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/admin/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add admin');
        }

        return data;
    },

    removeAdmin: async (username) => {
        const token = tokenService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/admin/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to remove admin');
        }

        return data;
    }
};
