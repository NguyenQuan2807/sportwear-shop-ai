import axiosClient from "../api/axiosClient";

export const getSportsApi = () => {
  return axiosClient.get("/api/sports");
};
