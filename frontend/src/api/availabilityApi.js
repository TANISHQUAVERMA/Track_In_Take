import axiosInstance from "./axiosInstance";

export const getMySlots = (date) => {
  return axiosInstance.get(
    "/appointments/nutritionist/me/slots/",
    { params: { date } }
  );
};

export const addAvailability = (data) => {
  return axiosInstance.post(
    "/appointments/nutritionist/add-availability/",
    data
  );
};

export const deleteAvailability = (id) => {
  return axiosInstance.delete(
    `/appointments/nutritionist/me/slots/${id}/`
  );
};

