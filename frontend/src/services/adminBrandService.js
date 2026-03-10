import axiosClient from "../api/axiosClient";

export const getAdminBrandsApi = () => {
  return axiosClient.get("/api/admin/brands");
};

export const getAdminBrandDetailApi = (id) => {
  return axiosClient.get(`/api/admin/brands/${id}`);
};

export const createAdminBrandApi = (data) => {
  return axiosClient.post("/api/admin/brands", data);
};

export const updateAdminBrandApi = (id, data) => {
  return axiosClient.put(`/api/admin/brands/${id}`, data);
};

export const deleteAdminBrandApi = (id) => {
  return axiosClient.delete(`/api/admin/brands/${id}`);
};