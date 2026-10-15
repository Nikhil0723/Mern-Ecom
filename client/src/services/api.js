
import axios from "axios";
import { finishRequest, startRequest } from "@/lib/apiInspector";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);

        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        localStorage.removeItem("userInfo");
      }
    }

    // Record requests in development and production.
    config.__inspector = startRequest(config);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const inspector = response.config.__inspector;

    if (inspector) {
      finishRequest(
        inspector.id,
        inspector.startedAt,
        response,
        null
      );
    }

    return response;
  },
  (error) => {
    const inspector = error.config?.__inspector;

    if (inspector) {
      finishRequest(
        inspector.id,
        inspector.startedAt,
        null,
        error
      );
    }

    return Promise.reject(error);
  }
);

export default api;
