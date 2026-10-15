import api from "./api";

export const getAdminOrders = async () => {
  const response = await api.get("/api/orders");

  return response.data;
};

export const getAdminOrder = async (id) => {
  const response = await api.get(`/api/orders/${id}`);

  return response.data;
};

export const markOrderAsDelivered = async (id) => {
  const response = await api.put(
    `/api/orders/${id}/deliver`
  );

  return response.data;
};