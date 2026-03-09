package com.nguyenhuuquan.sportwearshop.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBrandRequest {

    @NotBlank(message = "Tên thương hiệu không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;
    private String logoUrl;
    private Boolean isActive;
}