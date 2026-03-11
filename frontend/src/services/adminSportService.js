import axiosClient from "../api/axiosClient";

export const getAdminSportsApi = () => {
  return axiosClient.get("/api/admin/sports");
};

export const getAdminSportDetailApi = (id) => {
  return axiosClient.get(`/api/admin/sports/${id}`);
};

export const createAdminSportApi = (data) => {
  return axiosClient.post("/api/admin/sports", data);
};

export const updateAdminSportApi = (id, data) => {
  return axiosClient.put(`/api/admin/sports/${id}`, data);
};

export const deleteAdminSportApi = (id) => {
  return axiosClient.delete(`/api/admin/sports/${id}`);
};