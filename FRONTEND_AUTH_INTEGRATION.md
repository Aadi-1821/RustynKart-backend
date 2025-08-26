# Frontend Authentication Integration Guide for RustyNKart

This document provides detailed instructions for integrating authentication between the frontend and backend of RustyNKart.

## Table of Contents

1. [Authentication Architecture](#authentication-architecture)
2. [Backend Authentication Endpoints](#backend-authentication-endpoints)
3. [Frontend Integration](#frontend-integration)
4. [Troubleshooting](#troubleshooting)
5. [Security Considerations](#security-considerations)

## Authentication Architecture

The RustyNKart authentication system uses JWT (JSON Web Tokens) for authentication. Due to the cross-origin nature of our deployment (frontend on Vercel, backend on Render), we've implemented a hybrid approach:

- **JWT tokens** are stored in localStorage on the frontend
- Tokens are sent with each request via **Authorization header** and **X-Auth-Token header**
- Backend validates tokens using middleware

## Backend Authentication Endpoints

### Login Endpoints

- **Regular Login**: `POST /api/auth/login`
  ```json
  {
    "email": "user@example.com", 
    "password": "password123"
  }
  ```

- **Google Login**: `POST /api/auth/googlelogin`
  ```json
  {
    "name": "User Name", 
    "email": "user@gmail.com"
  }
  ```

- **Admin Login**: `POST /api/auth/adminlogin`
  ```json
  {
    "email": "admin@rustynkart.com",
    "password": "adminPassword"
  }
  ```

### Response Format

All login endpoints return the following response on success:

```json
{
  "_id": "user-mongodb-id",
  "name": "User Name",
  "email": "user@example.com",
  "token": "jwt-token-string",
  ... (other user data)
}
```

### Protected Endpoints

These endpoints require authentication:

- **Get Current User**: `GET /api/user/getcurrentuser`
- **Get Cart**: `POST /api/cart/get`
- **Add to Cart**: `POST /api/cart/add`
- **All Order Endpoints**: `/api/order/*`

## Frontend Integration

### Setup for React Applications

1. **Install the AuthHelper**

   Copy the `authHelper.js` file from `backend/utils/clientHelpers/` to your frontend project.

2. **Configure Axios with Authentication**

   ```jsx
   import axios from 'axios';
   import { loadAuthData, configureAuthHeaders } from './path/to/authHelper';
   
   // Create an axios instance
   const api = axios.create({
     baseURL: 'https://rustynkart-backend.onrender.com',
     withCredentials: true
   });
   
   // Configure auth headers on startup
   const authData = loadAuthData();
   if (authData && authData.token) {
     api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
     api.defaults.headers.common['X-Auth-Token'] = authData.token;
   }
   
   export default api;
   ```

3. **Create Authentication Context**

   ```jsx
   // AuthContext.jsx
   import React, { createContext, useState, useEffect } from 'react';
   import { loadAuthData, saveAuthData, clearAuthData } from './path/to/authHelper';
   import api from './api';
   
   export const AuthContext = createContext();
   
   export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     
     // Load auth data on startup
     useEffect(() => {
       const authData = loadAuthData();
       if (authData && authData.userData) {
         setUser(authData.userData);
       }
       setLoading(false);
     }, []);
     
     // Login function
     const login = async (email, password) => {
       try {
         const response = await api.post('/api/auth/login', { email, password });
         const userData = saveAuthData(response);
         setUser(userData);
         return userData;
       } catch (error) {
         console.error('Login failed:', error);
         throw error;
       }
     };
     
     // Google login function
     const googleLogin = async (googleData) => {
       try {
         const response = await api.post('/api/auth/googlelogin', {
           name: googleData.name,
           email: googleData.email
         });
         const userData = saveAuthData(response);
         setUser(userData);
         return userData;
       } catch (error) {
         console.error('Google login failed:', error);
         throw error;
       }
     };
     
     // Logout function
     const logout = async () => {
       try {
         await api.get('/api/auth/logout');
       } catch (error) {
         console.error('Logout API call failed:', error);
       } finally {
         clearAuthData();
         setUser(null);
       }
     };
     
     // Check current user
     const checkCurrentUser = async () => {
       try {
         const response = await api.get('/api/user/getcurrentuser');
         setUser(response.data);
         return response.data;
       } catch (error) {
         console.error('Error getting current user:', error);
         clearAuthData();
         setUser(null);
         return null;
       }
     };
     
     const value = {
       user,
       loading,
       login,
       googleLogin,
       logout,
       checkCurrentUser
     };
     
     return (
       <AuthContext.Provider value={value}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

4. **Wrap Your App with the Auth Provider**

   ```jsx
   // App.jsx or index.jsx
   import React from 'react';
   import { AuthProvider } from './context/AuthContext';
   
   function App() {
     return (
       <AuthProvider>
         {/* Your app components */}
       </AuthProvider>
     );
   }
   ```

5. **Use Authentication in Components**

   ```jsx
   import React, { useContext } from 'react';
   import { AuthContext } from './context/AuthContext';
   
   function Profile() {
     const { user, logout } = useContext(AuthContext);
     
     if (!user) {
       return <div>Please log in</div>;
     }
     
     return (
       <div>
         <h1>Welcome, {user.name}</h1>
         <p>Email: {user.email}</p>
         <button onClick={logout}>Logout</button>
       </div>
     );
   }
   ```

### Google Login Integration

1. **Set Up Firebase Authentication**

   Follow the Firebase setup instructions and add the Google sign-in provider.

2. **Implement the Login Component**

   ```jsx
   import React, { useContext } from 'react';
   import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
   import { AuthContext } from './context/AuthContext';
   
   function Login() {
     const { googleLogin } = useContext(AuthContext);
     
     const handleGoogleLogin = async () => {
       try {
         const auth = getAuth();
         const provider = new GoogleAuthProvider();
         const result = await signInWithPopup(auth, provider);
         
         // Get user details from Google Auth
         const user = result.user;
         
         // Send to backend
         await googleLogin({
           name: user.displayName,
           email: user.email
         });
         
         // Redirect or update UI
       } catch (error) {
         console.error('Google login error:', error);
       }
     };
     
     return (
       <div>
         <button onClick={handleGoogleLogin}>Sign in with Google</button>
       </div>
     );
   }
   ```

## Troubleshooting

### Common Issues

1. **Authentication Failures**

   If you're experiencing authentication failures, use the diagnostic endpoint:
   
   ```javascript
   import { runAuthDiagnostic } from './path/to/authHelper';
   import api from './api';
   
   // In a component or debugging function
   const runDiagnostic = async () => {
     const result = await runAuthDiagnostic(api);
     console.log('Auth Diagnostic Result:', result);
   };
   ```

2. **Cross-Origin Cookie Issues**

   Our system primarily uses localStorage for token storage due to cross-origin limitations. If you're experiencing issues, check:
   
   - Browser console for CORS errors
   - Network tab for failed requests
   - Cookie settings in your browser
   
   You can test third-party cookie support:
   
   ```javascript
   import { checkThirdPartyCookieSupport } from './path/to/authHelper';
   
   const checkCookieSupport = async () => {
     const isSupported = await checkThirdPartyCookieSupport();
     console.log('Third-party cookies supported:', isSupported);
   };
   ```

3. **Token Not Being Sent**

   Ensure your Axios instance is properly configured:
   
   ```javascript
   // Check headers are being sent
   api.interceptors.request.use(request => {
     console.log('Request Headers:', request.headers);
     return request;
   });
   ```

## Security Considerations

1. **Token Storage**

   We use localStorage for token storage due to cross-origin limitations. This carries some XSS risks. Mitigate by:
   
   - Implementing proper Content Security Policy (CSP)
   - Sanitizing all user inputs
   - Setting short token expiration times

2. **Token Refresh Strategy**

   When implementing token refresh:
   
   ```javascript
   api.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       // If the error is 401 and we haven't already tried refreshing
       if (error.response.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         
         try {
           // Call refresh token endpoint
           const response = await api.post('/api/auth/refresh');
           const newToken = response.data.token;
           
           // Update token in storage and headers
           localStorage.setItem('rusty_auth_token', newToken);
           api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
           api.defaults.headers.common['X-Auth-Token'] = newToken;
           
           // Retry the original request
           return api(originalRequest);
         } catch (refreshError) {
           // If refresh fails, log out user
           clearAuthData();
           // Redirect to login or update application state
           return Promise.reject(refreshError);
         }
       }
       
       return Promise.reject(error);
     }
   );
   ```

3. **Admin Authentication**

   For admin routes, implement additional security:
   
   - Separate admin JWT claims
   - IP restriction for admin operations
   - Enhanced logging for admin actions
   - 2FA for admin authentication

---

For further assistance or to report security concerns, contact the development team.