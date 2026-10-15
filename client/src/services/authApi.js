import api from "./api";

export const loginUser = async (credentials) => {
  const { data } = await api.post("/api/users/login", credentials);

  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post("/api/users/register", userData);

  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/api/users/profile");

  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await api.put("/api/users/profile", userData);

  return data;
};