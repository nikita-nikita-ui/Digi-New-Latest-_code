import axios from 'axios';

// Base URL definition
const BASE_URL = "https://digiapp-node-1-t1w3.onrender.com/api";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized - Redirecting to login...");
            localStorage.clear(); // Clear everything
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;
