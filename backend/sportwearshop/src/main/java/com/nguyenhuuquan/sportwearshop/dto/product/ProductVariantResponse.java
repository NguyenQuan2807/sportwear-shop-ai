package com.nguyenhuuquan.sportwearshop.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantResponse {
    private Long id;
    private String size;
    private String color;
    private Double price;
    private Integer stockQuantity;
    private String sku;
}