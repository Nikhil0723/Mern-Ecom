import api from "./api";

export const getOffers = async () => {
  const response = await api.get("/api/offers");
  return response.data;
};

export const getActiveOffers = async () => {
  const response = await api.get("/api/offers/active");
  return response.data;
};

export const getOffer = async (id) => {
  const response = await api.get(`/api/offers/${id}`);
  return response.data;
};

export const createOffer = async (offerData) => {
  const response = await api.post(
    "/api/offers",
    offerData
  );

  return response.data;
};

export const updateOffer = async (id, offerData) => {
  const response = await api.put(
    `/api/offers/${id}`,
    offerData
  );

  return response.data;
};

export const deleteOffer = async (id) => {
  const response = await api.delete(
    `/api/offers/${id}`
  );

  return response.data;
};