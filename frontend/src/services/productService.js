import axiosClient from "../api/axiosClient";

export const getProductsApi = () => {
  return axiosClient.get("/api/products");
};

export const getProductDetailApi = (id) => {
  return axiosClient.get(`/api/products/${id}`);
};