package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.OrderStatus;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.review.CreateReviewRequest;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.ReviewSummaryResponse;
import com.nguyenhuuquan.sportwearshop.dto.review.UpdateReviewRequest;
import com.nguyenhuuquan.sportwearshop.entity.*;
import com.nguyenhuuquan.sportwearshop.repository.OrderItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ReviewRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            ReviewRepository reviewRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(String email, CreateReviewRequest request) {
        User user = getUserByEmail(email);

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong đơn hàng"));

        Order order = orderItem.getOrder();

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Bạn không có quyền đánh giá sản phẩm này");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Chỉ có thể đánh giá khi đơn hàng đã hoàn thành");
        }

        if (reviewRepository.existsByOrderItem(orderItem)) {
            throw new BadRequestException("Sản phẩm này trong đơn hàng đã được đánh giá");
        }

        ProductVariant productVariant = orderItem.getProductVariant();
        Product product = productVariant.getProduct();

        Review review = new Review();
        review.setUser(user);
        review.setOrder(order);
        review.setOrderItem(orderItem);
        review.setProduct(product);
        review.setProductVariant(productVariant);
        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse updateMyReview(String email, Long reviewId, UpdateReviewRequest request) {
        User user = getUserByEmail(email);

        Review review = reviewRepository.findByIdAndUser(reviewId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));

        if (review.getOrder().getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Chỉ có thể chỉnh sửa đánh giá của đơn hàng đã hoàn thành");
        }

        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        return reviewRepository.findByProductOrderByCreatedAtDesc(product)
                .stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummaryByProduct(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        ReviewSummaryResponse response = new ReviewSummaryResponse();
        response.setAverageRating(reviewRepository.getAverageRatingByProductId(productId));
        response.setTotalReviews(reviewRepository.countByProductId(productId));
        return response;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }

        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setProductVariantId(
                review.getProductVariant() != null ? review.getProductVariant().getId() : null
        );
        response.setOrderId(review.getOrder().getId());
        response.setOrderItemId(review.getOrderItem().getId());
        response.setUserFullName(review.getUser().getFullName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setSize(
                review.getProductVariant() != null ? review.getProductVariant().getSize() : null
        );
        response.setColor(
                review.getProductVariant() != null ? review.getProductVariant().getColor() : null
        );
        response.setCreatedAt(
                review.getCreatedAt() != null ? review.getCreatedAt().toString() : null
        );
        return response;
    }
}
