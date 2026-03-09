import axiosClient from "../api/axiosClient";

export const getCartApi = () => {
  return axiosClient.get("/api/cart");
};

export const addToCartApi = (data) => {
  return axiosClient.post("/api/cart/items", data);
};

export const updateCartItemApi = (cartItemId, data) => {
  return axiosClient.put(`/api/cart/items/${cartItemId}`, data);
};

export const deleteCartItemApi = (cartItemId) => {
  return axiosClient.delete(`/api/cart/items/${cartItemId}`);
};