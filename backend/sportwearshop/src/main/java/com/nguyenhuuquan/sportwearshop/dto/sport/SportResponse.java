package com.nguyenhuuquan.sportwearshop.dto.sport;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SportResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Long productCount;
    private Boolean isActive;
}
