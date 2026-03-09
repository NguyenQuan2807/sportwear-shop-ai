package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductVariantResponse {
    private Long id;
    private Long productId;
    private String size;
    private String color;
    private Double price;
    private Integer stockQuantity;
    private String sku;
}