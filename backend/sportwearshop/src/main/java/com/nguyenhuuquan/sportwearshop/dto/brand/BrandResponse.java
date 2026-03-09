package com.nguyenhuuquan.sportwearshop.dto.brand;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private Boolean isActive;
}