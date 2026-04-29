import axiosInstance from "./axiosInstance";

export const getTodayRecommendation = () =>
  axiosInstance.get("/recommendations/today/");

export const generateRecommendation = (force = false) =>
  axiosInstance.post("/recommendations/generate/", { force });

export const submitMealFeedback = (data) =>
  axiosInstance.post("/recommendations/feedback/", data);

export const getMealFeedback = () =>
  axiosInstance.get("/recommendations/feedback/today/");
