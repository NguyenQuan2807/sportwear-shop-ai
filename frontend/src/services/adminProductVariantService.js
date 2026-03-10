import axiosClient from "../api/axiosClient";

export const getAdminProductVariantsApi = (productId) => {
  return axiosClient.get(`/api/admin/product-variants/product/${productId}`);
};

export const createAdminProductVariantApi = (productId, data) => {
  return axiosClient.post(`/api/admin/product-variants/product/${productId}`, data);
};

export const updateAdminProductVariantApi = (variantId, data) => {
  return axiosClient.put(`/api/admin/product-variants/${variantId}`, data);
};

export const deleteAdminProductVariantApi = (variantId) => {
  return axiosClient.delete(`/api/admin/product-variants/${variantId}`);
};