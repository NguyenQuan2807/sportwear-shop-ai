import axiosClient from "../api/axiosClient";

export const getAdminPromotionsApi = () => {
  return axiosClient.get("/api/admin/promotions");
};

export const getAdminPromotionDetailApi = (id) => {
  return axiosClient.get(`/api/admin/promotions/${id}`);
};

export const createAdminPromotionApi = (data) => {
  return axiosClient.post("/api/admin/promotions", data);
};

export const updateAdminPromotionApi = (id, data) => {
  return axiosClient.put(`/api/admin/promotions/${id}`, data);
};

export const deleteAdminPromotionApi = (id) => {
  return axiosClient.delete(`/api/admin/promotions/${id}`);
};