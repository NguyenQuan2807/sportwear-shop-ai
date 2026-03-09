package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;

    @NotNull(message = "categoryId không được để trống")
    private Long categoryId;

    @NotNull(message = "brandId không được để trống")
    private Long brandId;

    @NotNull(message = "sportId không được để trống")
    private Long sportId;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;

    private String material;
    private String thumbnailUrl;
}