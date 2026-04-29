// ReminderApi.js
import axiosInstance from "./axiosInstance"; // ✅ Import the configured instance

// The instance already knows the base URL, so we don't need to define it here.
// The instance's interceptors already handle auth headers, so we don't need a helper function.

// ✅ Create Reminder
export const reminderCreate = async (formData) => {
  // Use the instance directly. No need to pass headers.
  // The request interceptor will add the token automatically.
  const response = await axiosInstance.post('/reminders/', formData);
  return response.data;
};

// ✅ Get All Reminders
export const getAllReminder = async () => {
  // The instance handles the base URL and auth headers.
  const response = await axiosInstance.get('/reminders/');
  return response.data;
};

// ✅ Delete Reminder
export const deleteReminder = async (id) => {
  const response = await axiosInstance.delete(`/reminders/${id}/`);
  return response.data;
};

// ✅ Trigger Reminders
export const triggerReminders = async () => {
  // This is a POST request, so we pass null or {} if no body is needed.
  // The interceptor handles the headers.
  const response = await axiosInstance.post('/trigger-reminders/', {});
  return response.data;
};