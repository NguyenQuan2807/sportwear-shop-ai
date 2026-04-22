import axiosClient from "../api/axiosClient";

export const getMyProfileApi = () => axiosClient.get("/api/profile");
export const updateMyProfileApi = (data) => axiosClient.put("/api/profile", data);

export const getMyAddressesApi = () => axiosClient.get("/api/profile/addresses");
export const createMyAddressApi = (data) => axiosClient.post("/api/profile/addresses", data);
export const updateMyAddressApi = (id, data) => axiosClient.put(`/api/profile/addresses/${id}`, data);
export const deleteMyAddressApi = (id) => axiosClient.delete(`/api/profile/addresses/${id}`);
