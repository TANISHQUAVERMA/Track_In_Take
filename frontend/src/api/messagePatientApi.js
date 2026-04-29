// src/api/messagesApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the one, true instance

// ❌ The local instance creation and interceptor are no longer needed.
// Your main axiosInstance handles the base URL and auth headers automatically.

// --- API FUNCTIONS ---

/**
 * Fetches all messages for the authenticated user.
 * Corresponds to: GET /api/messages/
 * @returns {Promise<axios.Response>} The API response with the list of messages.
 */
export const getMessages = () => {
  // ✅ Use the global instance. It handles everything.
  return axiosInstance.get('/messages/');
};

/**
 * Sends a new message to a specific receiver.
 * Corresponds to: POST /api/messages/send/
 * @param {number} receiverId - The ID of the user who will receive the message.
 * @param {string} text - The content of the message.
 * @returns {Promise<axios.Response>} The API response with the newly created message object.
 */
export const sendMessage = (receiverId, text) => {
  const payload = {
    receiver: receiverId,
    text: text,
  };
  // ✅ Use the global instance.
  return axiosInstance.post('/messages/send/', payload);
};

/**
 * Marks messages from a specific sender as read.
 * Corresponds to: POST /api/messages/mark-read/
 * @param {object} payload - The request payload, e.g., { sender_id: 3 }.
 * @returns {Promise<axios.Response>} The API response.
 */
export const markMessageAsRead = (payload) => {
  // ✅ Use the global instance.
  return axiosInstance.post('/messages/mark-read/', payload);
};

/**
 * Fetches the nutritionist assigned to the current patient.
 * Corresponds to: GET /api/patient/my-nutritionist/
 * @returns {Promise<axios.Response>} The API response with the nutritionist's details.
 */
export const getMyNutritionist = () => {
  // ✅ Use the global instance.
  return axiosInstance.get('/patient/my-nutritionist/');
};