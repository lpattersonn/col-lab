/**
 * useAuth Hook
 *
 * React hook for authentication state and operations.
 * Provides a consistent interface for auth across components.
 *
 * @example
 * function MyComponent() {
 *   const { user, isLoggedIn, login, logout, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   if (!isLoggedIn) {
 *     return <button onClick={() => login('user', 'pass')}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.displayName}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';

/**
 * Authentication hook
 *
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.validateOnMount=false] - Validate session on mount
 * @returns {Object} Auth state and methods
 */
const useAuth = (options = {}) => {
  const { validateOnMount = false } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(validateOnMount);

  // Get user details from storage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userDetails'));
    } catch {
      return null;
    }
  }, []);

  // Check if user is logged in
  const isLoggedIn = useMemo(() => {
    return !!user?.token;
  }, [user]);

  // Validate session on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      const validate = async () => {
        setIsValidating(true);
        try {
          const isValid = await authService.validateSession();
          if (!isValid && user) {
            // Token invalid - clear and redirect
            tokenService.clearTokens();
            window.location.replace('/login');
          }
        } finally {
          setIsValidating(false);
        }
      };
      validate();
    }
  }, [validateOnMount, user]);

  /**
   * Login with credentials
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await authService.login(username, password);
      // Force re-render by triggering state update
      window.dispatchEvent(new Event('storage'));
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   * @param {Object} [options] - Logout options
   */
  const logout = useCallback((options = {}) => {
    authService.logout(options);
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh the access token manually
   * @returns {Promise<string>} New access token
   */
  const refresh = useCallback(async () => {
    try {
      return await authService.refreshAccessToken();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    // State
    user,
    isLoggedIn,
    isLoading,
    isValidating,
    error,

    // Actions
    login,
    logout,
    refresh,
    clearError,

    // Utilities
    getAccessToken: tokenService.getAccessToken,
    isTokenExpired: () => tokenService.isTokenExpired(user?.token),
  };
};

export default useAuth;
