import axiosClient from "../api/axiosClient";

export const checkEmailApi = (email) => {
  return axiosClient.get("/api/auth/check-email", { params: { email } });
};

export const requestRegisterCodeApi = (data) => {
  return axiosClient.post("/api/auth/register/request-code", data);
};

export const completeRegisterApi = (data) => {
  return axiosClient.post("/api/auth/register/complete", data);
};

export const loginApi = (data) => {
  return axiosClient.post("/api/auth/login", data);
};

export const forgotPasswordApi = (data) => {
  return axiosClient.post("/api/auth/forgot-password", data);
};

export const resetPasswordApi = (data) => {
  return axiosClient.post("/api/auth/reset-password", data);
};

// export const refreshTokenApi = (refreshToken) => {
//   return axiosClient.post("/api/auth/refresh", { refreshToken });
// };

export const getCurrentUserApi = () => {
  return axiosClient.get("/api/auth/me");
};
