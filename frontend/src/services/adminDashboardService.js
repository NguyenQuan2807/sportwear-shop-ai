import axiosClient from "../api/axiosClient";

export const getAdminDashboardStatsApi = () => {
  return axiosClient.get("/api/admin/dashboard");
};