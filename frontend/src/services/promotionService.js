import axiosClient from "../api/axiosClient";

export const getActivePromotionsApi = () => {
  return axiosClient.get("/api/promotions/active");
};
