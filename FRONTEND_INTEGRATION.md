# Frontend Integration Guide for RustynKart Backend

This guide explains how to properly connect your frontend application to the RustynKart backend API, particularly focusing on authentication and cross-origin requests.

## Table of Contents

1. [API Base URL](#api-base-url)
2. [Authentication](#authentication)
   - [Cookie-Based Authentication](#cookie-based-authentication)
   - [Token-Based Authentication](#token-based-authentication)
3. [CORS Configuration](#cors-configuration)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## API Base URL

Production: `https://rustynkart-backend.onrender.com`
Development: `http://localhost:8000`

## Authentication

The backend supports two authentication methods:

### Cookie-Based Authentication

This is the default method, where the server sets an HTTP-only cookie upon successful login:

```javascript
// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rustynkart-backend.onrender.com',
  withCredentials: true, // THIS IS CRITICAL for cookies to work
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Login example
async function login(email, password) {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password
    });
    
    // The cookie is automatically handled by the browser
    // You can store user info in your state management
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Google login example
async function googleLogin(userInfo) {
  try {
    const response = await api.post('/api/auth/googlelogin', {
      name: userInfo.displayName,
      email: userInfo.email
    });
    
    return response.data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

// Making authenticated requests
async function getUserProfile() {
  try {
    const response = await api.get('/api/user/getcurrentuser');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}
```

### Token-Based Authentication

If you're experiencing issues with cookies, you can use token-based authentication:

```javascript
// Using axios with token-based auth
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rustynkart-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Store the token in memory or localStorage
let authToken = null;

// Login and store token
async function login(email, password) {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password
    });
    
    // The server now returns the token in the response
    authToken = response.data.token;
    
    // Optionally store in localStorage (less secure but persistent)
    localStorage.setItem('authToken', authToken);
    
    // Set the default Authorization header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Load token from storage on app initialization
function initializeAuth() {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    authToken = storedToken;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  }
}

// Making authenticated requests with token
async function getUserProfile() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await api.get('/api/user/getcurrentuser');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

// Logout
function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
  
  // Also call the logout endpoint to clear cookies
  return api.get('/api/auth/logout');
}
```

## CORS Configuration

The backend has CORS configured to accept requests from the following origins:

- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:3000`
- `https://rusty-kart.onrender.com`
- `https://rustynkart.onrender.com`
- `https://rustynkart-frontend.vercel.app`

If your frontend is hosted on a different domain, you'll need to contact the backend administrator to add it to the allowed origins list.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login with email and password
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/googlelogin` - Login with Google
  ```json
  {
    "name": "User Name",
    "email": "user@example.com"
  }
  ```

- `GET /api/auth/logout` - Logout

### User

- `GET /api/user/getcurrentuser` - Get current user profile
- `PUT /api/user/update` - Update user profile

### Products

- `GET /api/product/list` - Get all products
- `GET /api/product/:id` - Get a single product by ID
- `POST /api/product/add` - Add a new product (admin only)
- `PUT /api/product/update/:id` - Update a product (admin only)
- `DELETE /api/product/delete/:id` - Delete a product (admin only)

### Cart

- `POST /api/cart/get` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/delete` - Remove item from cart

### Orders

- `POST /api/order/add` - Create a new order
- `GET /api/order/get` - Get user's orders

## Error Handling

The API returns standardized error responses:

```json
{
  "message": "Human-readable error message",
  "error": "error_code",
  "details": "Additional details if available"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required or failed)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found
- `500` - Server Error

## Testing

You can use the following test endpoints to verify your configuration:

- `GET /test-cookie` - Sets a test cookie and returns current cookies
- `GET /test-auth` - Checks if authentication is working
- `GET /api/auth/test-client-auth` - Tests client-side cookie functionality
- `GET /api/health` - API health check endpoint

## Troubleshooting

### 1. Authentication Failures (401 Errors)

If you're getting authentication errors:

- Check that `withCredentials: true` is set in your axios config
- Verify your origin is in the allowed CORS list
- Try using token-based authentication instead
- Check for console errors related to cookies or CORS
- Use the `/test-cookie` endpoint to debug cookie issues

### 2. CORS Errors

CORS errors typically show up in the browser console:

- Make sure your frontend domain is in the allowed origins list
- Check that you're not using a different port in development than what's allowed
- For local development, use exact URLs (e.g., `http://localhost:5173`, not just `localhost:5173`)

### 3. Cookie Issues

- Some browsers block third-party cookies by default
- Safari has Intelligent Tracking Prevention that may block cookies
- Check that you're using HTTPS in production (cookies with SameSite=None require Secure attribute)

### 4. Request Issues

- Double check the API endpoint paths and request formats
- Ensure Content-Type is properly set to application/json
- Validate your request data before sending