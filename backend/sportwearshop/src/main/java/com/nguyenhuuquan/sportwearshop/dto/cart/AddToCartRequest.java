package com.nguyenhuuquan.sportwearshop.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToCartRequest {

    @NotNull(message = "productVariantId không được để trống")
    private Long productVariantId;

    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "quantity phải lớn hơn 0")
    private Integer quantity;
}