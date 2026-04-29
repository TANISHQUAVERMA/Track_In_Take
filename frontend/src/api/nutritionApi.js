// src/api/nutritionApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL and getAuthHeaders functions are no longer needed.

/**
 * Searches for a food item and returns its nutrition details.
 * @param {string} foodName - The name of the food to search for.
 * @returns {Promise<object|null>} A promise that resolves to the first matching food object, or null if not found.
 * @throws {Error} Throws an error with a user-friendly message if the API call fails.
 */
export const searchFoodNutrition = async (foodName) => {
  try {
    // ✅ Use axiosInstance and the 'params' object for clean, safe URL generation.
    // The interceptor will automatically add the auth token.
    const response = await axiosInstance.get('/foods/', {
      params: {
        search: foodName
      }
    });

    // ✅ This critical business logic to extract the first result is perfectly preserved.
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0]; // Return the first food object
    } else {
      return null; // No results found
    }
  } catch (error) {
    // ✅ Your custom error handling logic is also preserved.
    console.error("Error fetching food nutrition:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || "Failed to fetch food nutrition. Please try again."
    );
  }
};