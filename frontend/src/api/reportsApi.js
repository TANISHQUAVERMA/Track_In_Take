// src/api/targetApi.js (or whatever the filename is)

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL, axiosRetry setup, and getAuthHeaders helper are all removed.

/**
 * GET /recommend-calories/
 * Fetches user's calorie and macronutrient recommendations.
 * @param {string} currentDate - The user's current local date in 'YYYY-MM-DD' format.
 */
export const targetApi = async (currentDate) => {
  // ✅ The input validation is preserved.
  if (!currentDate) throw new Error("currentDate is required for targetApi.");
  
  // ✅ Use the instance with the 'params' object for clean query string handling.
  const response = await axiosInstance.get('/recommend-calories/', {
    params: { current_date: currentDate }
  });
  return response.data;
};

/**
 * GET /daily-calorie-summary/
 * Fetches the calorie and macronutrient summary for a specific day.
 * @param {string} date - The target date in 'YYYY-MM-DD' format.
 */
export const targetProgressApi = async (date) => {
  // ✅ The input validation is preserved.
  if (!date) throw new Error("date is required for targetProgressApi.");

  // ✅ The call is simplified using the instance and the 'params' object.
  const response = await axiosInstance.get('/daily-calorie-summary/', {
    params: { date }
  });
  return response.data;
}

/**
 * GET /nutrition7day/
 * Fetches nutritional data for the 7-day period ending on the given date.
 * @param {string} endDate - The end date for the 7-day range in 'YYYY-MM-DD' format.
 */
export const weeklyTrack = async (endDate) => {
  // ✅ The input validation is preserved.
  if (!endDate) throw new Error("endDate is required for weeklyTrack.");
  
  // ✅ The call is simplified using the instance and the 'params' object.
  const response = await axiosInstance.get('/nutrition7day/', {
    params: { end_date: endDate }
  });
  return response.data;
};