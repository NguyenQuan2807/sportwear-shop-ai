package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.review.CreateReviewRequest;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewSummaryResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.UpdateReviewRequest;
import com.nguyenhuuquan.sportwearshop.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ReviewResponse createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return reviewService.createReview(authentication.getName(), request);
    }

    @PutMapping("/{reviewId}")
    public ReviewResponse updateMyReview(
            Authentication authentication,
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        return reviewService.updateMyReview(authentication.getName(), reviewId, request);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> getReviewsByProduct(@PathVariable Long productId) {
        return reviewService.getReviewsByProduct(productId);
    }

    @GetMapping("/product/{productId}/summary")
    public ReviewSummaryResponse getReviewSummaryByProduct(@PathVariable Long productId) {
        return reviewService.getReviewSummaryByProduct(productId);
    }
}
