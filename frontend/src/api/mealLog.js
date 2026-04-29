// src/api/mealLog.js

import axiosInstance from './axiosInstance';
import { pushMealNotifications } from '../components/components/NotificationDropdown';


export const getMeals = async (url) => {
  try {
    // THE FIX IS HERE:
    // We enforce HTTPS on the URL provided by the backend to prevent mixed-content errors.
    const secureUrl = url.replace(/^http:\/\//, 'https://');

    // Axios will now use the secure, absolute URL, and its interceptors will work.
    const response = await axiosInstance.get(secureUrl);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching paginated meals:', error.response?.data || error.message);
    throw error;
  }
};

// getMealsByDate remains the same. It correctly calls the relative path for the first page.
export const getMealsByDate = async (date) => {
  try {
    const url = `/logmeals/?date=${date}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching meals by date:', error.response?.data || error.message);
    throw error;
  }
};

// --- All other functions (create, patch, delete) remain the same ---

export const createMeal = async (mealData) => {
  try {
    const response = await axiosInstance.post('/logmeals/', mealData);
    if (response.data && response.data.notifications && response.data.notifications.length > 0) {
      pushMealNotifications(response.data.notifications);
    }
    return response.data;
  } catch (error) {
    console.error('❌ Error creating meal:', error.response?.data);
    throw error;
  }
};

export const patchMeal = async (mealId, partialMealData) => {
  try {
    const response = await axiosInstance.patch(`/logmeals/${mealId}/`, partialMealData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error patching meal ${mealId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteMeal = async (mealId) => {
  try {
    const response = await axiosInstance.delete(`/logmeals/${mealId}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting meal ${mealId}:`, error.response?.data || error.message);
    throw error;
  }
};