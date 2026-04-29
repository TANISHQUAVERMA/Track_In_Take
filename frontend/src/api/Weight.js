// src/api/Weight.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL and getAuthHeaders helper function are no longer needed.

/**
 * Fetches all weight entries for the authenticated user.
 */
export const getWeight = async () => {
  // ✅ Use the instance directly. It handles the base URL and auth headers.
  const response = await axiosInstance.get('/weight/');
  return response.data;
};

/**
 * Creates a new weight entry.
 * @param {object} formData - The data for the new weight entry (e.g., { weight_kg: 75 }).
 */
export const postWeight = async (formData) => {
  // ✅ The instance handles headers, so we just pass the endpoint and data.
  const response = await axiosInstance.post('/weight/', formData);
  return response.data;
};