import axiosClient from "../api/axiosClient";

export const createOrderApi = (data) => {
  return axiosClient.post("/api/orders", data);
};

export const getMyOrdersApi = () => {
  return axiosClient.get("/api/orders");
};

export const getOrderDetailApi = (id) => {
  return axiosClient.get(`/api/orders/${id}`);
};