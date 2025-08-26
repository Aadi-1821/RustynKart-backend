/**
 * Authentication Helper for RustyNKart Frontend
 *
 * This file provides utility functions to handle authentication
 * between the frontend and backend, specifically designed to work
 * with the cross-origin setup between Vercel and Render.
 */

// Constants
const TOKEN_KEY = 'rusty_auth_token';
const USER_DATA_KEY = 'rusty_user_data';

/**
 * Saves authentication information after successful login
 * @param {Object} response - The response from the login API
 * @returns {Object} The user data object
 */
export const saveAuthData = (response) => {
  try {
    // Extract token and user data
    const { token, ...userData } = response.data;

    if (!token) {
      console.error('No token received in login response');
      return null;
    }

    // Save token to localStorage
    localStorage.setItem(TOKEN_KEY, token);

    // Save user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

    // Configure headers for future requests
    configureAuthHeaders(token);

    return userData;
  } catch (error) {
    console.error('Failed to save auth data:', error);
    return null;
  }
};

/**
 * Configure axios instances with authentication headers
 * @param {string} token - The JWT token
 */
export const configureAuthHeaders = (token) => {
  // This function should be called by your Axios configuration
  // to set default headers for all requests
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token
    }
  };
};

/**
 * Loads authentication data from storage on app initialization
 * @returns {Object|null} The authentication configuration object or null if not authenticated
 */
export const loadAuthData = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    // Get user data if available
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    const userData = userDataString ? JSON.parse(userDataString) : {};

    return {
      isAuthenticated: true,
      token,
      userData,
      authConfig: configureAuthHeaders(token)
    };
  } catch (error) {
    console.error('Failed to load auth data:', error);
    return null;
  }
};

/**
 * Clear authentication data on logout
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Get the current authentication token
 * @returns {string|null} The current token or null if not authenticated
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get the current user data
 * @returns {Object|null} The user data or null if not available
 */
export const getUserData = () => {
  try {
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

/**
 * Run authentication diagnostic
 * @param {Object} axios - Axios instance
 * @returns {Promise<Object>} Diagnostic results
 */
export const runAuthDiagnostic = async (axios) => {
  try {
    // Check what we have in storage
    const token = getToken();
    const userData = getUserData();

    // Set the token in headers for this request
    const headers = token ? {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token
    } : {};

    // Call the diagnostic endpoint
    const response = await axios.get('/api/auth/diagnostic', { headers });

    // Return the diagnostic information
    return {
      localStorageData: {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : null,
        hasUserData: !!userData,
      },
      serverResponse: response.data,
      cookies: document.cookie,
    };
  } catch (error) {
    console.error('Auth diagnostic failed:', error);
    return {
      error: error.message,
      status: 'failed',
    };
  }
};

/**
 * Check if browser supports third-party cookies
 * @returns {Promise<boolean>} True if supported, false otherwise
 */
export const checkThirdPartyCookieSupport = async () => {
  try {
    const testEndpoint = '/api/auth/test-client-auth';
    const response = await fetch(testEndpoint, {
      method: 'GET',
      credentials: 'include'
    });

    await response.json();

    // Check if we received the test cookie
    return document.cookie.includes('client-test-cookie');
  } catch (error) {
    console.error('Third-party cookie test failed:', error);
    return false;
  }
};

// Export a default object with all functions
export default {
  saveAuthData,
  loadAuthData,
  configureAuthHeaders,
  clearAuthData,
  getToken,
  isAuthenticated,
  getUserData,
  runAuthDiagnostic,
  checkThirdPartyCookieSupport
};
