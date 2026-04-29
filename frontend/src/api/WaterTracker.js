// Filename: src/api/WaterTracker.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL and getAuthHeaders helper function are no longer needed.
// ❌ The unused 'refreshToken' import has been removed.

/**
 * Fetches the total water logged for a specific day.
 * @param {string} date - The target date in 'YYYY-MM-DD' format.
 */
export const getTotalWaterForDate = async (date) => {
  // ✅ The try/catch/alert is removed. Axios will automatically throw an error
  //    on a non-2xx response, which is a better pattern for the API layer.
  const response = await axiosInstance.get('/water/total/', {
    params: { date }
  });
  return response.data;
};

/**
 * Fetches a paginated history of daily water totals.
 * @param {number} [page=1] - The page number to fetch.
 */
export const getWaterHistory = async (page = 1) => {
  // ✅ The cache-busting logic is preserved within the clean 'params' object.
  const response = await axiosInstance.get('/water/', {
    params: { page, _: Date.now() }
  });
  return response.data;
};

/**
 * Fetches the individual water log entries for a specific date.
 * @param {string} date - The target date in 'YYYY-MM-DD' format.
 */
export const getWaterLogForDate = async (date) => {
  // ✅ Preserving the cache-buster here as well.
  const response = await axiosInstance.get('/water/log/', {
    params: { date, _: Date.now() }
  });
  return response.data;
};

/**
 * Creates a new water log entry.
 * @param {object} formData - The data for the new entry (e.g., { amount_ml: 250 }).
 */
export const postWater = async (formData) => {
  const response = await axiosInstance.post('/water/', formData);
  return response.data;
};

/**
 * Fetches water log data for a specific date.
 * @param {string} date - The target date in 'YYYY-MM-DD' format.
 */
export const getWater = async (date) => {
  const response = await axiosInstance.get('/water/', {
    params: { date }
  });
  return response.data;
};