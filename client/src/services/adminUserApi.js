import api from "./api";

export const getAdminUsers = async () => {
  const response = await api.get("/api/users");

  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/api/users/${id}`);

  return response.data;
};