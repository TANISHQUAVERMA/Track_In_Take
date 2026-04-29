// src/api/blog.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The getAuthHeaders function is no longer needed. The interceptor handles it.
// ❌ The BASE_URL constant is no longer needed. The instance has it.

/**
 * Fetches a paginated list of blogs.
 * @param {number} page - The page number to fetch.
 * @param {number} perPage - The number of blogs to fetch per page.
 * @returns {Promise<object>} A promise that resolves to the paginated response { count, next, previous, results }.
 */
export const getblogs = async (page = 1, perPage = 6) => {
  // ✅ Use axiosInstance.get() instead of fetch.
  // The interceptor will automatically add the Authorization header.
  const response = await axiosInstance.get('/blogs/', {
    // ✅ Pass query parameters using the 'params' object for clean and safe URL generation.
    params: {
      page: page,
      page_size: perPage,
    },
  });

  // ✅ Return response.data, which is where axios places the JSON body from the server.
  // axios automatically handles JSON parsing.
  return response.data;
};