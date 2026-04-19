package com.nguyenhuuquan.sportwearshop.dto.wishlist;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToWishlistRequest {
    @NotNull(message = "productId không được để trống")
    private Long productId;
}
