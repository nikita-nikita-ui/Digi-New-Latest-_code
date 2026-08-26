import apiClient from "./axiosInstance/Base_url";

// --- Create Admin User ---
export const createAdminUser = async (formData) => {
    try {
      
        const response = await apiClient.post('/admin/users/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};


export const updateUserAPI = async (id, formData) => {
    try {
        const response = await apiClient.put(`/admin/users/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};


export const deleteUserAPI = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/delete/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Network Error");
    }
};