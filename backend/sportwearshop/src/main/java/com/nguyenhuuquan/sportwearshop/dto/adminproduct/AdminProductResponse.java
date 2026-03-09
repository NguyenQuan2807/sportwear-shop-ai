package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductResponse {
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
    private Long categoryId;
    private Long brandId;
    private Long sportId;
}