import axiosClient from "../api/axiosClient";

export const getAdminUsersApi = () => {
  return axiosClient.get("/api/admin/users");
};

export const updateAdminUserApi = (id, data) => {
  return axiosClient.put(`/api/admin/users/${id}`, data);
};

export const deleteAdminUserApi = (id) => {
  return axiosClient.delete(`/api/admin/users/${id}`);
};
