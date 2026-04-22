import axiosClient from "../api/axiosClient";

export const createReviewApi = (data) => axiosClient.post("/api/reviews", data);

export const updateReviewApi = (reviewId, data) =>
  axiosClient.put(`/api/reviews/${reviewId}`, data);

export const getProductReviewsApi = (productId) =>
  axiosClient.get(`/api/reviews/product/${productId}`);

export const getProductReviewSummaryApi = (productId) =>
  axiosClient.get(`/api/reviews/product/${productId}/summary`);
