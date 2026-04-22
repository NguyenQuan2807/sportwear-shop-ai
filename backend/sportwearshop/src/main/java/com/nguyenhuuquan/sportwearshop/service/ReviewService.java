package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.review.CreateReviewRequest;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewSummaryResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.UpdateReviewRequest;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(String email, CreateReviewRequest request);
    ReviewResponse updateMyReview(String email, Long reviewId, UpdateReviewRequest request);
    List<ReviewResponse> getReviewsByProduct(Long productId);
    ReviewSummaryResponse getReviewSummaryByProduct(Long productId);
}
