package com.nguyenhuuquan.sportwearshop.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponse {
    private Long id;
    private Long productId;
    private Long productVariantId;
    private String productName;
    private String thumbnailUrl;
    private String size;
    private String color;
    private Double price;
    private Integer quantity;
    private Double totalPrice;
}