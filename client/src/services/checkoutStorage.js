const SHIPPING_STORAGE_KEY = "shippingAddress";
const PAYMENT_STORAGE_KEY = "paymentMethod";
const COUPON_STORAGE_KEY = "appliedCoupon";

export const getShippingAddress = () => {
  try {
    const data = localStorage.getItem(SHIPPING_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem(SHIPPING_STORAGE_KEY);
    return null;
  }
};

export const saveShippingAddress = (shippingAddress) => {
  localStorage.setItem(
    SHIPPING_STORAGE_KEY,
    JSON.stringify(shippingAddress)
  );
};

export const getPaymentMethod = () => {
  return localStorage.getItem(PAYMENT_STORAGE_KEY) || null;
};

export const savePaymentMethod = (paymentMethod) => {
  localStorage.setItem(PAYMENT_STORAGE_KEY, paymentMethod);
};

export const getAppliedCoupon = () => {
  try {
    const data = localStorage.getItem(COUPON_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem(COUPON_STORAGE_KEY);
    return null;
  }
};

export const saveAppliedCoupon = (coupon) => {
  localStorage.setItem(
    COUPON_STORAGE_KEY,
    JSON.stringify(coupon)
  );
};

export const removeAppliedCoupon = () => {
  localStorage.removeItem(COUPON_STORAGE_KEY);
};

export const clearCheckoutStorage = () => {
  localStorage.removeItem(SHIPPING_STORAGE_KEY);
  localStorage.removeItem(PAYMENT_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
};