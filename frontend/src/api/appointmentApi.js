import axiosInstance from "./axiosInstance";

/**
 * Get available slots for a nutritionist on a given date
 */
export const getAvailableSlots = (nutritionistId, date) => {
  return axiosInstance.get(
    `/appointments/nutritionist/${nutritionistId}/slots/`,
    {
      params: { date },
    }
  );
};

/**
 * Book an appointment
 */
export const bookAppointment = (payload) => {
  return axiosInstance.post("/appointments/book/", payload);
};

/**
 * Get logged-in user's appointments
 */
export const getMyAppointments = () => {
  return axiosInstance.get("/appointments/my/");
};

/**
 * Nutritionist adds availability
 */
export const addAvailability = (data) => {
  return axiosInstance.post(
    "/appointments/nutritionist/add-availability/",
    data
  );
};
export const getMyInHouseNutritionist = () =>
  axiosInstance.get("/appointments/me/in-house-nutritionist/");
export const getExpertNutritionists = () => {
  return axiosInstance.get("/appointments/expert-nutritionists/");
};
