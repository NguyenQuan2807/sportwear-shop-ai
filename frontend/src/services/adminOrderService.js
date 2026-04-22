import axiosClient from "../api/axiosClient";

export const getAdminOrdersApi = () => {
  return axiosClient.get("/api/admin/orders");
};

export const getAdminOrderDetailApi = (id) => {
  return axiosClient.get(`/api/admin/orders/${id}`);
};

export const updateAdminOrderStatusApi = (id, data) => {
  const payload = typeof data === "string" ? { status: data } : data;
  return axiosClient.put(`/api/admin/orders/${id}/status`, payload);
};