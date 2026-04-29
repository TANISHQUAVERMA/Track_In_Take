// src/api/nutritionistApi.js

import axiosInstance from './axiosInstance'; // ✅ Import the one, true instance

// ❌ All local instance creation, interceptors, and delay functions are removed.

// ✅ Create a single, reusable config object for file uploads.
const fileUploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

// --------- Nutritionist-Scoped API Calls (/api/nutritionist/...) ---------

export const assignPatient = (patientId) => {
  return axiosInstance.post('/nutritionist/assign-patient/', { patient_id: patientId });
};

export const getAssignedPatients = (query = '') => {
  // Assuming query is a string like "?search=John"
  return axiosInstance.get(`/nutritionist/patients/${query}`);
};

export const getPatientProfile = (patientId) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/profile/`);
};

export const updatePatientProfile = (patientId, updateData) => {
  
  // 1. Add the "/api" prefix to the URL
  // 2. Pass `updateData` as the second argument to .put()
  return axiosInstance.put(
    `/nutritionist/patients/${patientId}/profile/`, 
    updateData
  );
};

export const getPatientMeals = (patientId) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/meals/`);
};

export const getPatientMealsByDate = (patientId, date) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/meals/`, {
    params: { date }
  });
};

export const getAllUsers = (page = 1, pageSize = 20) => {
  return axiosInstance.get('/nutritionist/users/', {
    params: { page, page_size: pageSize }
  });
};

export const searchUsersByName = (name) => {
  return axiosInstance.get('/nutritionist/users/', {
    params: { search: name }
  });
};

export const editDiet = (dietId, payload) => {
  return axiosInstance.patch(`/nutritionist/diet-plans/${dietId}/edit/`, payload);
};

export const reviewDietPlan = (dietId, action, comment) => {
  return axiosInstance.post(`/nutritionist/diet-plans/${dietId}/review/`, { action, comment });
};

export const submitFeedbackForML = (dietId, feedback, approved) => {
  return axiosInstance.post(`/nutritionist/diet-plans/${dietId}/feedback/`, { feedback, approved });
};

// In nutritionistApi.js
export const getDietByPatientId = (patientId) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/diet-plans`);
};

export const getDietRecommendationUsers = (page = 1, pageSize = 10) => {
  return axiosInstance.get('/nutritionist/diet-plans/recommendations/', {
    params: { page, page_size: pageSize }
  });
};

// ✅ File upload case, uses the special config
export const createUserPatient = (userData) => {
  return axiosInstance.post('/nutritionist/create-patient/', userData, fileUploadConfig);
};

// ✅ Lab Report Functions scoped to a patient under the nutritionist
export const getAllLabReports = (patientId) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/lab-reports/`);
};

export const getLabReportByDate = (patientId, date) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/lab-reports/`, {
    params: { report_date: date }
  });
};

// The patientId is needed to build the correct, secure API endpoint path.
export const updateLabReport = (patientId, reportId, updatedData) => {
  // [THE FINAL FIX]
  // This function now uses the PATCH method and the plural "/patients/" path,
  // exactly matching your working Postman request.
  // The reportId uniquely identifies the resource to be updated.
  return axiosInstance.patch(
    `nutritionist/patients/${patientId}/lab-reports/${reportId}/`,
    updatedData
  );
};

// ✅ Daily Summary and Target Nutrients scoped to a patient
export const getDailySummary = (patientId, date) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/daily-summary/`, {
    params: { date }
  });
};

export const getTargetNutrients = (patientId, date) => {
  return axiosInstance.get(`/nutritionist/patients/${patientId}/target-nutrients/`, {
    params: { current_date: date }
  });
};


// --------- General API Calls (/api/...) ---------
// These are not under the /nutritionist scope.

export const generateDietPlan = (patientId) => {
  return axiosInstance.post(
    `/nutritionist/patients/${patientId}/generate-plan/`,
    {}, // empty body (if needed)
    { timeout: 15000 } // 10 seconds timeout
  );
};


  export const sendMessage = (receiverId, text) => {
    return axiosInstance.post('/messages/send/', { receiver: receiverId, text: text });
  };

  export const getMessages = () => {
    return axiosInstance.get('/messages/');
  };

  export const markMessageAsRead = (payload) => {
    return axiosInstance.post('/messages/mark-read/', payload);
  };
// archiveDietPlan.js
export const archiveDietPlan = (dietId) =>
  axiosInstance.patch(`/nutritionist/diet-plans/${dietId}/archive/`);

// restoreDietPlan.js
export const restoreDietPlan = (dietId) =>
  axiosInstance.patch(`/nutritionist/diet-plans/${dietId}/restore/`);
