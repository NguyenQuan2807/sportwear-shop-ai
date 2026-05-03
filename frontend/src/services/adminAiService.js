import axiosClient from "../api/axiosClient";

export const getAdminDashboardInsightApi = ({
  period = "month",
  date,
  month,
  year,
} = {}) => {
  return axiosClient.get("/api/admin/ai/dashboard-insight", {
    params: {
      period,
      date,
      month,
      year,
    },
  });
};

export const getAdminPromotionSuggestionsApi = () => {
  return axiosClient.get("/api/admin/ai/promotion-suggestions");
};
