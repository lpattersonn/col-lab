/**
 * Services Index
 *
 * Central export point for all service modules.
 * Import from 'services' instead of individual files.
 *
 * @example
 * import { api, authService, tokenService } from '../services';
 *
 * // Or import specific functions
 * import { login, logout } from '../services/authService';
 */

// Token management
export { default as tokenService } from './tokenService';
export {
  getUserDetails,
  getAccessToken,
  getRefreshToken,
  setTokens,
  updateAccessToken,
  updateRefreshToken,
  clearTokens,
  isAuthenticated,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
} from './tokenService';

// Authentication
export { default as authService } from './authService';
export {
  login,
  logout,
  validateSession,
  refreshAccessToken,
  getCurrentUser,
} from './authService';

// API client with interceptors
export { default as api } from './api';
export { apiClient, validateSession as validateApiSession } from './api';
