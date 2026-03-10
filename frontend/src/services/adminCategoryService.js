import axiosClient from "../api/axiosClient";

export const getAdminCategoriesApi = () => {
  return axiosClient.get("/api/admin/categories");
};

export const getAdminCategoryDetailApi = (id) => {
  return axiosClient.get(`/api/admin/categories/${id}`);
};

export const createAdminCategoryApi = (data) => {
  return axiosClient.post("/api/admin/categories", data);
};

export const updateAdminCategoryApi = (id, data) => {
  return axiosClient.put(`/api/admin/categories/${id}`, data);
};

export const deleteAdminCategoryApi = (id) => {
  return axiosClient.delete(`/api/admin/categories/${id}`);
};