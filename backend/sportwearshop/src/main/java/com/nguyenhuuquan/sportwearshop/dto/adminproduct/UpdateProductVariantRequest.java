package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductVariantRequest {

    @NotBlank(message = "Size không được để trống")
    private String size;

    @NotBlank(message = "Màu không được để trống")
    private String color;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán phải >= 0")
    private Double price;

    @NotNull(message = "Giá nhập không được để trống")
    @Min(value = 0, message = "Giá nhập phải >= 0")
    private Double costPrice;

    @NotNull(message = "Tồn kho không được để trống")
    @Min(value = 0, message = "Tồn kho phải >= 0")
    private Integer stockQuantity;

    @NotBlank(message = "SKU không được để trống")
    private String sku;
}
