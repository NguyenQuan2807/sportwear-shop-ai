import axiosClient from "../api/axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("/api/auth/login", data);
};

export const registerApi = (data) => {
  return axiosClient.post("/api/auth/register", data);
};

export const verifyRegisterCodeApi = (data) => {
  return axiosClient.post("/api/auth/register/verify", data);
};

export const forgotPasswordApi = (data) => {
  return axiosClient.post("/api/auth/forgot-password", data);
};

export const resetPasswordApi = (data) => {
  return axiosClient.post("/api/auth/reset-password", data);
};

export const getCurrentUserApi = () => {
  return axiosClient.get("/api/auth/me");
};
