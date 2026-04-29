import axiosInstance from './axiosInstance';

// ✅ Sirf patient plans fetch karo
export const getPlans = async () => {
  const res = await axiosInstance.get('/subscriptions/plans/?type=patient');
  return res.data;
};

// ✅ Order create karo
export const createOrder = async (planId) => {
  const res = await axiosInstance.post('/subscriptions/create-order/', {
    plan_id: planId
  });
  return res.data;
};

// ✅ Meri subscription fetch karo
export const getMySubscription = async () => {
  const res = await axiosInstance.get('/subscriptions/my/');
  return res.data;
};

// ✅ Registration se pehle order create karo
export const createRegistrationOrder = async (planId, email) => {
  const res = await axiosInstance.post('/subscriptions/user-registration-order/', {
    plan_id: planId,
    email: email
  });
  return res.data;
  // Note: agar res.data.already_paid === true
  // toh frontend plan screen skip kare
};

// ✅ Payment verify karo
export const verifyPayment = async (paymentData) => {
  const res = await axiosInstance.post('/subscriptions/verify-payment/', paymentData);
  return res.data;
};
// Consultation fee ka order banao
export const payConsultationFee = async (consultType) => {
  const res = await axiosInstance.post('/subscriptions/pay-consultation/', {
    consult_type: consultType
  });
  return res.data;
};