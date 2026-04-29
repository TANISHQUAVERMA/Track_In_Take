// src/api/profileApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL, delay, and getAuthHeaders functions are no longer needed.

/**
 * Creates a new user profile.
 * @param {object} profileData - The data for the new profile.
 */
export const createUserProfile = async (profileData) => {
  // ✅ The call is simplified using the instance.
  const response = await axiosInstance.post('/profile/', profileData);
  return response.data;
};

/**
 * Fetches the authenticated user's profile.
 * Returns null if the user has not created a profile yet (404 response).
 */
export const getUserProfile = async () => {
  try {
    // ✅ The call is simplified, but wrapped in a try...catch block
    //    to preserve the special 404 handling logic.
    const response = await axiosInstance.get('/profile/');
    return response.data;
  } catch (error) {
    // ✅ This logic is CRITICAL and is preserved.
    // It handles the specific case of a new user without a profile.
    if (error.response && error.response.status === 404) {
      return null; // A 404 is an expected state for a new user, not an error.
    }
    throw error; // Re-throw all other errors (e.g., 500 server errors)
  }
};

/**
 * Updates an existing user profile (partial update).
 * @param {object} profileData - The profile fields to update.
 */
export const updateUserProfile = async (profileData) => {
  // ✅ The call is simplified using the instance.
  const response = await axiosInstance.patch('/profile/', profileData);
  return response.data;
};