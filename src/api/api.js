import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

// Function to handle logout
const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
};

// Add token and handle expired tokens globally
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Token = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.log("🚀 ~ error:", error)
            console.log("🚀 ~ error:", error.response)
            // Check if error is unauthorized (401) or token expired
            if (error.response.status === 401 ||
                error.response.data?.message?.toLowerCase().includes('token is not valid')) {
                handleLogout();
            }
        }
        return Promise.reject(error);
    }
);

export const signupUser = (userData) => api.post('/signup', userData);
export const loginUser = (loginData) => api.post('/login', loginData);
export const updateProfile = (userId, formData) => api.post(`/profile/${userId}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const uploadVideo = (userId, formData) => api.post(`/uploadVideo/${userId}`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const getVideos = (userId) => api.get(`/getVideos/${userId || ''}`);