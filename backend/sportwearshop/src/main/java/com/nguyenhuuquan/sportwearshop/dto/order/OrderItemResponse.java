package com.nguyenhuuquan.sportwearshop.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private Long productVariantId;
    private String productName;
    private String thumbnailUrl;
    private String size;
    private String color;

    private Double originalPrice;
    private Double discountAmount;
    private Double finalPrice;
    private Double price;
    private Integer quantity;
    private Double totalPrice;
    private String promotionName;
}