import { API_BASE_URL } from "./constants";

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
            throw new Error(data.message || 'Failed to fetch admins');
        }

        return data;
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
            throw new Error(data.message || 'Failed to add admin');
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
            throw new Error(data.message || 'Failed to remove admin');
        }

        return data;
    }
};