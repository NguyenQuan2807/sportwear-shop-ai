import axiosClient from "../api/axiosClient";

export const getAdminProductsApi = () => {
  return axiosClient.get("/api/admin/products");
};

export const getAdminProductDetailApi = (id) => {
  return axiosClient.get(`/api/admin/products/${id}`);
};

export const createAdminProductApi = (data) => {
  return axiosClient.post("/api/admin/products", data);
};

export const updateAdminProductApi = (id, data) => {
  return axiosClient.put(`/api/admin/products/${id}`, data);
};

export const deleteAdminProductApi = (id) => {
  return axiosClient.delete(`/api/admin/products/${id}`);
};