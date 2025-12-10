import axios from 'axios';

// FIXED: Use relative path for development with Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - Refresh token logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        
        if (refreshToken && userStr) {
          const user = JSON.parse(userStr);
          
          // FIXED: Use the same API_BASE_URL (now import.meta.env.VITE_API_BASE_URL)
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Forbidden access');
    }
    
    return Promise.reject(error);
  }
);

export default api;