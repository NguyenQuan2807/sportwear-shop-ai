package com.nguyenhuuquan.sportwearshop.dto.review;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewResponse {
    private Long id;
    private Long productId;
    private Long productVariantId;
    private Long orderId;
    private Long orderItemId;

    private String userFullName;
    private Integer rating;
    private String comment;

    private String size;
    private String color;
    private String createdAt;
}
