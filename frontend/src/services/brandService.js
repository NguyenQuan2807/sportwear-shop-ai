import axiosClient from "../api/axiosClient";

export const getBrandsApi = () => {
  return axiosClient.get("/api/brands");
};