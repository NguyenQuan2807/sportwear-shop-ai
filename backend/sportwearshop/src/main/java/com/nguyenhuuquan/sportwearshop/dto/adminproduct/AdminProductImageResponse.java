package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductImageResponse {

    private Long id;
    private Long productId;
    private String imageUrl;
    private String color;
    private Boolean isThumbnail;
    private Integer sortOrder;
}