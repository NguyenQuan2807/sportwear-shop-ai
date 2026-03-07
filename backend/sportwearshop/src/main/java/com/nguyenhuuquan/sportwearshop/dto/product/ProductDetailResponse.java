package com.nguyenhuuquan.sportwearshop.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String categoryName;
    private String brandName;
    private String sportName;
    private String gender;
    private String material;
    private String thumbnailUrl;
    private Boolean isActive;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
}