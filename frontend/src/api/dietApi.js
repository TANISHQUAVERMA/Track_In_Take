// src/api/dietApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL, axiosRetry call, and getAxiosConfig function are no longer needed.

// --- API FUNCTIONS ---

/**
 * Fetches the current active diet plan.
 * Endpoint: GET /diet/
 */
export const getDietApi = async () => {
  try {
    // ✅ Use axiosInstance directly. The base URL and auth headers are handled automatically.
    const response = await axiosInstance.get('/diet/');
    return response.data;
  } catch (error) {
    // ✅ This error handling is preserved. The component will receive this specific object on failure.
    console.error("API Error in getDietApi:", error.response?.data || error.message);
    return { status_code: "FETCH_ERROR", message: "Could not fetch active diet plan." };
  }
};

/**
 * Fetches the history of approved diet plans.
 * Endpoint: GET /diet-plan/history/?status=approved
 */
export const getDietHistoryApi = async () => {
  try {
    // ✅ Use axiosInstance and pass the 'params' object directly as the second argument.
    const response = await axiosInstance.get('/diet-plan/history/', {
      params: {
        status: 'approved'
      }
    });
    return response.data;
  } catch (error) {
    // ✅ This error handling is also preserved.
    console.error("API Error in getDietHistoryApi:", error.response?.data || error.message);
    return { status_code: "FETCH_ERROR", message: "Could not fetch diet plan history." };
  }
};