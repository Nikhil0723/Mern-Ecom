import api from "./api";

export const getProducts = async (params = {}) =>
  (await api.get("/api/products", { params })).data;

export const getProductById = async (id) =>
  (await api.get(`/api/products/${id}`)).data;

export const getTopProducts = async () =>
  (await api.get("/api/products/top")).data;

export const getFeaturedProducts = async () =>
  (await api.get("/api/products/featured")).data;

export const createProductReview = async (id, reviewData) =>
  (await api.post(`/api/products/${id}/reviews`, reviewData)).data;