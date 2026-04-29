// src/api/socialAuth.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The API_BASE_URL constant is no longer needed.

/**
 * Sends a Google OAuth access token to the backend to get a JWT.
 * Corresponds to: POST /api/google/
 * @param {string} access_token - The access token provided by Google Sign-In.
 */
export const loginWithGoogle = (access_token) => {
  // ✅ Use the instance. It handles the base URL.
  return axiosInstance.post('/google/', {
    access_token,
  });
};

/**
 * Sends a Facebook OAuth access token to the backend to get a JWT.
 * Corresponds to: POST /api/facebook/
 * @param {string} access_token - The access token provided by Facebook Login.
 */
export const loginWithFacebook = (access_token) => {
  // ✅ Use the instance. It handles the base URL.
  return axiosInstance.post('/facebook/', {
    access_token,
  });
};