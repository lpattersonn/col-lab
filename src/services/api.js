/**
 * Axios API Client with Refresh Token Support
 *
 * This module provides a pre-configured Axios instance with:
 * - Automatic access token attachment to all requests
 * - Automatic token refresh on 401 responses
 * - Request queuing during token refresh
 * - Infinite refresh loop prevention
 *
 * JWT Auth WordPress Plugin (v3.0+) Endpoints:
 * - Login: POST /wp-json/jwt-auth/v1/token
 * - Validate: POST /wp-json/jwt-auth/v1/token/validate
 * - Refresh: POST /wp-json/jwt-auth/v1/token/refresh
 */

import axios from 'axios';
import tokenService from './tokenService';

// Base URL from environment
const BASE_URL = process.env.REACT_APP_API_URL;

// Endpoints that don't require authentication (always public)
const PUBLIC_ENDPOINTS = [
  '/jwt-auth/v1/token',
];

// Check if endpoint is public
const isPublicEndpoint = (url, method) => {
  // Login/token endpoints are always public
  if (PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint))) {
    return true;
  }
  // Registration is POST to /users without auth (but GET needs auth)
  if (url?.includes('/wp/v2/users') && method?.toLowerCase() === 'post') {
    return true;
  }
  return false;
};

/**
 * Create Axios instance with default configuration
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Refresh token state management
 * Prevents multiple simultaneous refresh requests
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string>} New access token
 * @throws {Error} If refresh fails
 */
const refreshAccessToken = async () => {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // JWT Auth plugin expects refresh_token in request body
    const response = await axios.post(
      `${BASE_URL}/wp-json/jwt-auth/v1/token/refresh`,
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle different response formats
    const responseData = response.data?.data || response.data;
    const token = responseData.token || responseData.jwt || responseData.access_token;
    const newRefreshToken = responseData.refresh_token;

    if (!token) {
      throw new Error('No access token in refresh response');
    }

    // Update stored tokens
    tokenService.updateAccessToken(token);

    // Some implementations return a new refresh token (token rotation)
    if (newRefreshToken) {
      tokenService.updateRefreshToken(newRefreshToken);
    }

    return token;
  } catch (error) {
    // Clear tokens on refresh failure
    tokenService.clearTokens();
    throw error;
  }
};

/**
 * Request Interceptor
 * Automatically attaches access token to all authenticated requests
 */
api.interceptors.request.use(
  (config) => {
    // Skip token for public endpoints
    if (isPublicEndpoint(config.url, config.method)) {
      console.log('Request (public, no token):', config.url);
      return config;
    }

    const token = tokenService.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.warn('Request WITHOUT token:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 responses by refreshing the token and retrying the request
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Debug logging
    console.log('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message,
    });

    // Check if this is a 401 error
    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.code === 'jwt_auth_invalid_token' ||
      error.response?.data?.code === 'jwt_auth_expired_token';

    // Don't retry if:
    // 1. Not a 401 error
    // 2. Already retried this request
    // 3. This is a login/refresh request itself
    if (
      !isUnauthorized ||
      originalRequest._retry ||
      originalRequest.url?.includes('/jwt-auth/v1/token')
    ) {
      return Promise.reject(error);
    }

    // Check if we have a refresh token
    const refreshToken = tokenService.getRefreshToken();
    console.log('Refresh token available:', refreshToken ? 'Yes' : 'No');

    if (!refreshToken) {
      // No refresh token - don't logout automatically, just reject the error
      // This allows the app to handle 401 errors gracefully without forcing logout
      console.warn('No refresh token available. Cannot refresh access token.');
      return Promise.reject(error);
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Start refreshing
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      // Process queued requests with new token
      processQueue(null, newToken);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - process queue with error and logout
      processQueue(refreshError, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Handle user logout
 * Clears tokens and redirects to login page
 */
const handleLogout = () => {
  tokenService.clearTokens();
  // Use window.location for hard redirect to clear React state
  window.location.replace('/login');
};

/**
 * Manually trigger logout (for logout button)
 */
export const logout = () => {
  handleLogout();
};

/**
 * Check if user session is valid
 * Can be used to validate token on app load
 */
export const validateSession = async () => {
  const token = tokenService.getAccessToken();
  if (!token) return false;

  // Check if token is expired locally first
  if (tokenService.isTokenExpired(token)) {
    // Try to refresh
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      tokenService.clearTokens();
      return false;
    }

    try {
      await refreshAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  return true;
};

/**
 * API methods for convenience
 */
export const apiClient = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

// Export the configured axios instance as default
export default api;
