import api from "./api";

export const createRazorpayOrder = async ({
  orderItems,
  couponCode,
}) => {
  const { data } = await api.post(
    "/api/payments/razorpay/create-order",
    {
      orderItems,
      couponCode,
    }
  );

  return data;
};

export const verifyRazorpayPayment = async (
  paymentData
) => {
  const { data } = await api.post(
    "/api/payments/razorpay/verify",
    paymentData
  );

  return data;
};