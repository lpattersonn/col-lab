/**
 * Token Service
 *
 * Centralized token management for JWT authentication.
 * Handles storage, retrieval, and validation of access and refresh tokens.
 *
 * Architecture Decision: Using localStorage for tokens
 *
 * SECURITY TRADEOFFS:
 *
 * 1. localStorage (Current approach):
 *    - Pros: Simple, persists across tabs/sessions, works with SPA
 *    - Cons: Vulnerable to XSS attacks, accessible via JavaScript
 *    - Mitigation: Sanitize all user inputs, use CSP headers, short token lifetime
 *
 * 2. httpOnly Cookies (More secure, but complex with WordPress):
 *    - Pros: Not accessible via JavaScript, immune to XSS
 *    - Cons: Requires server-side changes, CORS complexity, CSRF concerns
 *    - WordPress would need custom plugin modifications
 *
 * 3. In-Memory (Most secure, worst UX):
 *    - Pros: Gone on tab close, not in any persistent storage
 *    - Cons: Lost on refresh, requires re-authentication
 *
 * RECOMMENDATION for WordPress + SPA:
 * Use localStorage with short-lived access tokens (10 min) + refresh tokens.
 * The refresh token pattern mitigates the risk since compromised access tokens
 * expire quickly. Ensure your WordPress site has proper XSS protections.
 */

const TOKEN_KEY = 'userDetails';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get stored user details including access token
 * @returns {Object|null} User details object or null
 */
export const getUserDetails = () => {
  try {
    const data = localStorage.getItem(TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing user details:', error);
    return null;
  }
};

/**
 * Get access token
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  const userDetails = getUserDetails();
  return userDetails?.token || null;
};

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Store tokens after login or refresh
 * @param {Object} params - Token parameters
 * @param {string} params.accessToken - JWT access token
 * @param {string} [params.refreshToken] - JWT refresh token
 * @param {Object} [params.userData] - Additional user data to store
 */
export const setTokens = ({ accessToken, refreshToken, userData = {} }) => {
  try {
    // Merge new token with existing or new user data
    const existingData = getUserDetails() || {};
    const newData = {
      ...existingData,
      ...userData,
      token: accessToken,
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(newData));

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Update only the access token (used during refresh)
 * @param {string} accessToken - New access token
 */
export const updateAccessToken = (accessToken) => {
  try {
    const userDetails = getUserDetails();
    if (userDetails) {
      userDetails.token = accessToken;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(userDetails));
    }
  } catch (error) {
    console.error('Error updating access token:', error);
  }
};

/**
 * Update refresh token (if server sends a new one during refresh)
 * @param {string} refreshToken - New refresh token
 */
export const updateRefreshToken = (refreshToken) => {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Error updating refresh token:', error);
  }
};

/**
 * Clear all authentication tokens and user data
 */
export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if user is authenticated (has tokens)
 * @returns {boolean} True if tokens exist
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Decode JWT token without verification (for client-side expiration check)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @param {number} [bufferSeconds=30] - Buffer time before actual expiration
 * @returns {boolean} True if token is expired or will expire within buffer
 */
export const isTokenExpired = (token, bufferSeconds = 30) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
};

export default {
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
};
