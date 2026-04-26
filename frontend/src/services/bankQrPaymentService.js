import axiosClient from "../api/axiosClient";

export const initQrCheckoutSessionApi = (data) =>
  axiosClient.post("/api/payments/qr/checkout-session/init", data);

export const getQrCheckoutSessionStatusApi = (sessionId) =>
  axiosClient.get(`/api/payments/qr/checkout-session/${sessionId}`);
