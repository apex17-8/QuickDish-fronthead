import axios, { AxiosError, type AxiosResponse } from 'axios';



// api.ts - Update base URL:
const API_BASE_URL = import.meta.env.DEV
  ? '/api' // This will use the proxy in development
  : import.meta.env.VITE_API_BASE_URL ||
    'https://quickdish-backend-2b6x.onrender.com/api';
// Base URL
//const API_BASE_URL =
  //import.meta.env.VITE_API_BASE_URL ||
 // 'https://quickdish-backend-2b6x.onrender.com/api';

console.log('🌐 Using API Base URL:', API_BASE_URL);
console.log('📱 Environment:', import.meta.env.MODE);

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Track in-flight requests to prevent duplicate calls
const requestMap = new Map();

// -----------------------------
// Request Interceptor
// -----------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Create request key to prevent duplicate calls
    const requestKey = `${config.method}-${config.url}`;
    
    // Cancel duplicate request if already in progress
    if (requestMap.has(requestKey)) {
      const cancelToken = requestMap.get(requestKey);
      cancelToken.cancel('Duplicate request cancelled');
    }
    
    // Add cancel token for this request
    const cancelToken = axios.CancelToken.source();
    config.cancelToken = cancelToken.token;
    requestMap.set(requestKey, cancelToken);

    if (import.meta.env.DEV) {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data ? JSON.stringify(config.data).substring(0, 100) : ''
      );
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// -----------------------------
// Response Interceptor
// -----------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Remove request from tracking map on completion
    const requestKey = `${response.config.method}-${response.config.url}`;
    requestMap.delete(requestKey);
    
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Remove request from tracking map on error
    if (error.config) {
      const requestKey = `${error.config.method}-${error.config.url}`;
      requestMap.delete(requestKey);
    }

    // Handle cancellation differently
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject({
        isCancelled: true,
        message: 'Request was cancelled'
      });
    }

    // Network error = CORS/preflight fail or server unreachable
    if (!error.response) {
      console.error('Network error - server unreachable or CORS issue:', {
        message: error.message,
        code: error.code,
        url: error.config?.url
      });
      
      return Promise.reject({
        message: 'Cannot connect to server. Please check your internet connection.',
        isNetworkError: true,
        originalError: error
      });
    }

    const status = error.response.status;
    const data = error.response.data as any;
    let errorMessage = data?.message || 'An error occurred';

    // Handle 401 Unauthorized
    if (status === 401) {
      errorMessage = 'Your session has expired. Please login again.';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('customer');

      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 800);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      errorMessage = 'You do not have permission to access this resource.';
    }

    // Handle 404 Not Found
    if (status === 404) {
      errorMessage = 'Resource not found.';
    }

    console.error(`API Error [${status}]`, {
      message: errorMessage,
      url: error.config?.url,
      data,
    });

    return Promise.reject({
      message: errorMessage,
      status,
      data,
      isNetworkError: false
    });
  }
);

// -----------------------------
// Health Check
// -----------------------------
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Use a shorter timeout for health check
    const res = await api.get('/health', { 
      timeout: 8000,
      validateStatus: (status) => status < 500
    });
    return true;
  } catch (error: any) {
    console.log('Backend health check failed:', error.message);
    return false;
  }
};

export default api;