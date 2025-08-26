/**
 * Helper functions for token-based authentication
 * This module provides utilities for both cookie-based and header-based auth
 */

/**
 * Sets authentication cookie for the response
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} options - Additional cookie options
 */
export const setAuthCookie = (res, token, options = {}) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
    ...options
  });

  // Also return the token in the response for clients that prefer header auth
  return token;
};

/**
 * Gets the token from request (either from cookies or Authorization header)
 * @param {Object} req - Express request object
 * @returns {string|null} The token or null if not found
 */
export const getTokenFromRequest = (req) => {
  let token = null;

  // Try to get token from cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  return token;
};

/**
 * Clears the authentication cookie
 * @param {Object} res - Express response object
 */
export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};

/**
 * Generates standard cookie options based on environment
 * @returns {Object} Cookie options
 */
export const getStandardCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

export default {
  setAuthCookie,
  getTokenFromRequest,
  clearAuthCookie,
  getStandardCookieOptions
};
