// api/subscriptionApi.js
import axiosInstance from './axiosInstance'; // your existing axios

export const getMySubscription = async () => {
  const res = await axiosInstance.get('/subscriptions/my/');
  return res.data;
};