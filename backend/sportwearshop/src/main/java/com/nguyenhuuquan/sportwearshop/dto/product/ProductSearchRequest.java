package com.nguyenhuuquan.sportwearshop.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSearchRequest {
    private String keyword;
    private Long categoryId;
    private Long brandId;
    private Long sportId;
    private Double minPrice;
    private Double maxPrice;
    private String sort = "newest";
    private Integer page = 0;
    private Integer size = 12;
}