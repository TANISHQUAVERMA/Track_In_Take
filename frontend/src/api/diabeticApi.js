// src/api/diabeticApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the configured instance

// ❌ The BASE_URL and helper functions are no longer needed.

// ✅ Create a single, reusable config object for file uploads.
// This will override the default 'Content-Type' of the axiosInstance.
const fileUploadConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

// --- API FUNCTIONS ---

// ✅ GET all lab reports (Standard JSON request)
export const getDiabeticProfile = async () => {
  // Use the instance directly. No special config needed.
  // The interceptor handles the base URL and auth token.
  const response = await axiosInstance.get('/lab-reports/');
  return response.data;
};

// ✅ CREATE a new lab report (File upload request)
export const createDiabeticProfile = async (formData) => {
  // Pass the special fileUploadConfig to override the default headers.
  const response = await axiosInstance.post('/lab-reports/', formData, fileUploadConfig);
  return response.data;
};

// ✅ UPDATE a lab report (File upload request)
export const updateDiabeticProfile = async (id, formData) => {
  if (!id) {
    throw new Error("Diabetic profile ID is required for update.");
  }
  // Also pass the fileUploadConfig here.
  const response = await axiosInstance.patch(`/lab-reports/${id}/`, formData, fileUploadConfig);
  return response.data;
};


// --- Other GET requests (Standard JSON requests) ---

// ✅ GET lab report by exact date
export const getLabReportByDate = async (date) => {
  // Use the 'params' object for clean query string handling.
  const response = await axiosInstance.get('/lab-reports/', {
    params: { report_date: date }
  });
  return response.data;
};

// ✅ GET lab reports by month prefix
export const getLabReportsByMonth = async (monthPrefix) => {
  const response = await axiosInstance.get('/lab-reports/', {
    params: { search: monthPrefix }
  });
  return response.data;
};

// ✅ GET latest lab reports (ordered)
export const getLatestLabReports = async () => {
  const response = await axiosInstance.get('/lab-reports/', {
    params: { ordering: '-report_date' }
  });
  return response.data;
};

// ✅ GET lab reports in a date range
export const getLabReportsInRange = async (startDate, endDate) => {
  const response = await axiosInstance.get('/lab-reports/', {
    params: {
      report_date__gte: startDate,
      report_date__lte: endDate
    }
  });
  return response.data;
};