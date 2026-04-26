import axiosClient from "../api/axiosClient";

export const getActivePromotionsApi = () => {
  return axiosClient.get("/api/promotions/active");
};

export const getVisiblePromotionsApi = () => {
  return axiosClient.get("/api/promotions/visible");
};
