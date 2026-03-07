package com.nguyenhuuquan.sportwearshop.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isThumbnail;
    private Integer sortOrder;
}