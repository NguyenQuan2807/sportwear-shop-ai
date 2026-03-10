import axiosClient from "../api/axiosClient";

export const getAdminProductImagesApi = (productId) => {
  return axiosClient.get(`/api/admin/product-images/product/${productId}`);
};

export const createAdminProductImageApi = (productId, data) => {
  return axiosClient.post(`/api/admin/product-images/product/${productId}`, data);
};

export const updateAdminProductImageApi = (imageId, data) => {
  return axiosClient.put(`/api/admin/product-images/${imageId}`, data);
};

export const deleteAdminProductImageApi = (imageId) => {
  return axiosClient.delete(`/api/admin/product-images/${imageId}`);
};