/**
 * Firebase Authentication Helper for RustyNKart Frontend
 *
 * This file provides utility functions to handle Firebase Authentication
 * between the frontend and the RustyNKart backend.
 */

// Import this file in your frontend React project and use it with your Firebase setup

/**
 * Initialize Firebase with your config
 * @param {Object} firebaseConfig - Your Firebase configuration object
 * @param {Function} initializeApp - Firebase's initializeApp function
 * @returns {Object} Firebase app instance
 */
export const initializeFirebase = (firebaseConfig, initializeApp) => {
  try {
    const app = initializeApp(firebaseConfig);
    console.log('Firebase App Initialized:', app.name);
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

/**
 * Handle Google sign-in with Firebase and backend integration
 * @param {Object} auth - Firebase auth object
 * @param {Function} signInWithPopup - Firebase's signInWithPopup function
 * @param {Object} GoogleAuthProvider - Firebase's GoogleAuthProvider class
 * @param {Function} axiosInstance - Configured Axios instance for backend API calls
 * @param {Function} saveAuthCallback - Callback to save auth data (from authHelper.js)
 * @returns {Promise<Object>} User data from backend
 */
export const handleGoogleSignIn = async (
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  axiosInstance,
  saveAuthCallback
) => {
  try {
    // 1. Firebase Authentication
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    console.log('Starting Google sign-in process...');

    const result = await signInWithPopup(auth, provider);

    // Extract user information from Firebase result
    const user = result.user;
    console.log('Firebase authentication successful for:', user.email);

    // 2. Get user data for backend authentication
    const userData = {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      firebaseUid: user.uid
    };

    // 3. Send to backend to create/login user
    console.log('Sending authentication data to backend...');
    const response = await axiosInstance.post('/api/auth/googlelogin', userData);

    console.log('Backend authentication successful:', response.data);

    // 4. Save authentication data using the provided callback
    if (saveAuthCallback) {
      saveAuthCallback(response);
    }

    return response.data;
  } catch (error) {
    console.error('Google login error:', error);

    // Enhanced error handling for specific Firebase auth errors
    if (error.code === 'auth/unauthorized-domain') {
      console.error(
        'DOMAIN ERROR: Your domain is not authorized in Firebase console. ' +
        'Add your domain to Firebase Console → Authentication → Settings → Authorized domains'
      );
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.error('Authentication cancelled: User closed the popup');
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.error('Authentication cancelled: Multiple popup requests');
    } else if (error.code === 'auth/popup-blocked') {
      console.error('Authentication popup blocked by browser');
    }

    throw error;
  }
};

/**
 * Sign out user from both Firebase and backend
 * @param {Object} auth - Firebase auth object
 * @param {Function} signOut - Firebase's signOut function
 * @param {Function} axiosInstance - Configured Axios instance
 * @param {Function} clearAuthCallback - Callback to clear auth data (from authHelper.js)
 * @returns {Promise<void>}
 */
export const handleSignOut = async (
  auth,
  signOut,
  axiosInstance,
  clearAuthCallback
) => {
  try {
    // 1. Sign out from Firebase
    await signOut(auth);
    console.log('Signed out from Firebase');

    // 2. Sign out from backend
    await axiosInstance.get('/api/auth/logout');
    console.log('Signed out from backend');

    // 3. Clear local auth data
    if (clearAuthCallback) {
      clearAuthCallback();
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Check current authentication state
 * @param {Object} auth - Firebase auth object
 * @param {Function} onAuthStateChanged - Firebase's onAuthStateChanged function
 * @param {Function} axiosInstance - Configured Axios instance
 * @param {Function} setUserCallback - Callback to set user data in application state
 * @returns {Function} Unsubscribe function
 */
export const setupAuthListener = (
  auth,
  onAuthStateChanged,
  axiosInstance,
  setUserCallback
) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log('Firebase user detected:', firebaseUser.email);

      try {
        // Get user data from backend
        const response = await axiosInstance.get('/api/user/getcurrentuser');
        console.log('Backend user data retrieved:', response.data);

        // Update application state
        if (setUserCallback) {
          setUserCallback(response.data);
        }
      } catch (error) {
        console.error('Error getting backend user data:', error);

        // If backend auth fails but Firebase auth exists,
        // user might need to authenticate with backend
        if (setUserCallback) {
          setUserCallback(null);
        }
      }
    } else {
      console.log('No Firebase user detected');
      if (setUserCallback) {
        setUserCallback(null);
      }
    }
  });
};

/**
 * Get Firebase ID token for custom backend authentication
 * @param {Object} user - Firebase user object
 * @returns {Promise<string>} Firebase ID token
 */
export const getFirebaseIdToken = async (user) => {
  if (!user) return null;

  try {
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
};

/**
 * Check if domain is authorized for Firebase
 * @returns {boolean} True if domain should be authorized
 */
export const checkDomainAuthorization = () => {
  const currentDomain = window.location.hostname;
  console.log('Current domain:', currentDomain);

  // Return message based on domain
  if (currentDomain === 'localhost') {
    return {
      authorized: true,
      message: 'Using localhost - should work for development'
    };
  } else if (currentDomain.includes('vercel.app')) {
    return {
      authorized: false,
      message: `Add "${currentDomain}" to Firebase Console → Authentication → Settings → Authorized domains`,
      domain: currentDomain
    };
  } else {
    return {
      authorized: false,
      message: `Unknown domain "${currentDomain}" - add to Firebase authorized domains`,
      domain: currentDomain
    };
  }
};

// Example usage pattern in React component:
/*
import {
  initializeFirebase,
  handleGoogleSignIn,
  handleSignOut
} from './path/to/firebaseAuthHelper';
import { saveAuthData, clearAuthData } from './path/to/authHelper';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import axios from './api'; // your configured axios instance

// In component:
const firebaseConfig = {
  // Your firebase config
};

// Initialize
const app = initializeFirebase(firebaseConfig, initializeApp);
const auth = getAuth(app);

// Login button handler
const handleLogin = async () => {
  try {
    const userData = await handleGoogleSignIn(
      auth,
      signInWithPopup,
      GoogleAuthProvider,
      axios,
      saveAuthData
    );
    console.log('User logged in:', userData);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout button handler
const handleLogout = async () => {
  try {
    await handleSignOut(auth, signOut, axios, clearAuthData);
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
*/

export default {
  initializeFirebase,
  handleGoogleSignIn,
  handleSignOut,
  setupAuthListener,
  getFirebaseIdToken,
  checkDomainAuthorization
};
