import api from "./api";

export const getCoupons = async () => {
    const response = await api.get("/api/coupons");
    return response.data;
};

export const getCoupon = async (id) => {
    const response = await api.get(`/api/coupons/${id}`);
    return response.data;
};

export const createCoupon = async (couponData) => {
    const response = await api.post(
        "/api/coupons",
        couponData
    );
    return response.data;
};

export const updateCoupon = async (id, couponData) => {
    const response = await api.put(
        `/api/coupons/${id}`,
        couponData
    );
    return response.data;
};

export const deleteCoupon = async (id) => {
    const response = await api.delete(
        `/api/coupons/${id}`
    );
    return response.data;
};

export const validateCoupon = async (couponData) => {
    const response = await api.post(
        "/api/coupons/validate",
        couponData
    );
    return response.data;
};