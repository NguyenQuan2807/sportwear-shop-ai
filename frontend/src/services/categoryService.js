import axiosClient from "../api/axiosClient";

export const getCategoriesApi = () => {
  return axiosClient.get("/api/categories");
};