import api from "./api";

export const createOrder = async (orderData) =>
  (await api.post("/api/orders", orderData)).data;

export const previewOrder = async (orderData) =>
  (await api.post("/api/orders/preview", orderData)).data;

export const getOrderById = async (id) =>
  (await api.get(`/api/orders/${id}`)).data;

export const getMyOrders = async () =>
  (await api.get("/api/orders/myorders")).data;