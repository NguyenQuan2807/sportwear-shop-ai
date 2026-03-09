import axiosClient from "../api/axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("/api/auth/login", data);
};

export const registerApi = (data) => {
  return axiosClient.post("/api/auth/register", data);
};

export const getCurrentUserApi = () => {
  return axiosClient.get("/api/auth/me");
};