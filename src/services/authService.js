/**
 * Authentication Service
 *
 * Handles login, logout, and session management.
 * Works with JWT Auth WordPress Plugin (v3.0+)
 *
 * Plugin Endpoints:
 * - POST /wp-json/jwt-auth/v1/token - Login (returns access + refresh tokens)
 * - POST /wp-json/jwt-auth/v1/token/validate - Validate current token
 * - POST /wp-json/jwt-auth/v1/token/refresh - Refresh access token
 */

import axios from 'axios';
import tokenService from './tokenService';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Login user and store tokens
 *
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data including tokens
 * @throws {Error} If login fails
 *
 * @example
 * try {
 *   const user = await authService.login('john@example.com', 'password123');
 *   console.log('Logged in:', user.email);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 */
export const login = async (username, password) => {
  try {
    // JWT Auth plugin expects form data or JSON
    const response = await axios.post(
      `${BASE_URL}/wp-json/jwt-auth/v1/token`,
      {
        username,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Debug: Log the full response to understand the format
    console.log('Login API response:', JSON.stringify(response.data, null, 2));

    // Handle different response formats (some plugins wrap in 'data')
    const responseData = response.data?.data || response.data;

    // Try different field names for the token
    const token = responseData.token || responseData.jwt || responseData.access_token;
    const refresh_token = responseData.refresh_token;

    console.log('Extracted token:', token ? 'Found' : 'NOT FOUND');
    console.log('Extracted refresh_token:', refresh_token ? 'Found' : 'NOT FOUND');

    if (!token) {
      console.error('Login response (no token):', response.data);
      throw new Error('No access token received from server');
    }

    // Extract user info from response - handle both old and new JWT plugin formats
    const user_id = responseData.user_id || responseData.id;
    const user_email = responseData.user_email || responseData.email;
    const user_nicename = responseData.user_nicename || responseData.nicename;
    const user_display_name = responseData.user_display_name || responseData.displayName;

    // The new plugin format includes firstName/lastName directly
    const firstName = responseData.firstName || responseData.first_name || '';
    const lastName = responseData.lastName || responseData.last_name || '';

    // Prepare user data object matching app's expected format
    const userData = {
      id: user_id,
      email: user_email,
      nicename: user_nicename,
      displayName: user_display_name,
      firstName: firstName || user_display_name?.split(' ')[0] || '',
      lastName: lastName || user_display_name?.split(' ').slice(1).join(' ') || '',
    };

    console.log('Extracted userData:', userData);

    // Store tokens and user data
    tokenService.setTokens({
      accessToken: token,
      refreshToken: refresh_token,
      userData,
    });

    // Debug: Verify tokens were stored correctly
    console.log('Stored userDetails:', localStorage.getItem('userDetails'));
    console.log('Stored refreshToken:', localStorage.getItem('refreshToken') ? 'Yes' : 'No');

    // Return user details for immediate use
    return {
      ...userData,
      token,
    };
  } catch (error) {
    // Extract meaningful error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      error.message ||
      'Login failed. Please check your credentials.';

    throw new Error(message);
  }
};

/**
 * Logout user and clear all stored data
 *
 * @param {Object} [options] - Logout options
 * @param {boolean} [options.redirect=true] - Whether to redirect to login page
 * @param {string} [options.redirectPath='/login'] - Path to redirect to
 *
 * @example
 * // Simple logout with redirect
 * authService.logout();
 *
 * // Logout without redirect (for custom handling)
 * authService.logout({ redirect: false });
 */
export const logout = (options = {}) => {
  const { redirect = true, redirectPath = '/login' } = options;

  // Clear all tokens and user data
  tokenService.clearTokens();

  // Optionally redirect to login
  if (redirect) {
    window.location.replace(redirectPath);
  }
};

/**
 * Validate current session
 * Checks if the user has valid tokens and optionally validates with server
 *
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.serverValidation=false] - Whether to validate with server
 * @returns {Promise<boolean>} True if session is valid
 *
 * @example
 * const isValid = await authService.validateSession();
 * if (!isValid) {
 *   // Redirect to login
 * }
 */
export const validateSession = async (options = {}) => {
  const { serverValidation = false } = options;

  const token = tokenService.getAccessToken();

  // No token = not authenticated
  if (!token) {
    return false;
  }

  // Check local expiration
  if (tokenService.isTokenExpired(token)) {
    // Token expired - try refresh
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

  // Optionally validate with server
  if (serverValidation) {
    try {
      await axios.post(
        `${BASE_URL}/wp-json/jwt-auth/v1/token/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  return true;
};

/**
 * Refresh the access token
 *
 * @returns {Promise<string>} New access token
 * @throws {Error} If refresh fails
 */
export const refreshAccessToken = async () => {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
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
      console.error('Refresh response:', response.data);
      throw new Error('No access token in refresh response');
    }

    // Update stored tokens
    tokenService.updateAccessToken(token);

    if (newRefreshToken) {
      tokenService.updateRefreshToken(newRefreshToken);
    }

    return token;
  } catch (error) {
    tokenService.clearTokens();
    throw error;
  }
};

/**
 * Get current user details from storage
 *
 * @returns {Object|null} User details or null if not authenticated
 *
 * @example
 * const user = authService.getCurrentUser();
 * if (user) {
 *   console.log(`Welcome, ${user.displayName}`);
 * }
 */
export const getCurrentUser = () => {
  return tokenService.getUserDetails();
};

/**
 * Check if user is currently authenticated
 *
 * @returns {boolean} True if user has valid tokens
 *
 * @example
 * if (authService.isAuthenticated()) {
 *   // Show dashboard
 * } else {
 *   // Show login
 * }
 */
export const isAuthenticated = () => {
  return tokenService.isAuthenticated();
};

/**
 * Get access token for manual use
 * Prefer using the api client which handles this automatically
 *
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  return tokenService.getAccessToken();
};

export default {
  login,
  logout,
  validateSession,
  refreshAccessToken,
  getCurrentUser,
  isAuthenticated,
  getAccessToken,
};
