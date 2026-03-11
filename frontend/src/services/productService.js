import axiosClient from "../api/axiosClient";

export const getProductsApi = (params) => {
  return axiosClient.get("/api/products", { params });
};

export const getProductDetailApi = (id) => {
  return axiosClient.get(`/api/products/${id}`);
};