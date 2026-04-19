import axiosClient from "../api/axiosClient";

export const getWishlistApi = () => {
  return axiosClient.get("/api/wishlist");
};

export const addWishlistItemApi = (data) => {
  return axiosClient.post("/api/wishlist/items", data);
};

export const deleteWishlistItemApi = (productId) => {
  return axiosClient.delete(`/api/wishlist/items/${productId}`);
};
