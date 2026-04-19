package com.nguyenhuuquan.sportwearshop.dto.wishlist;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WishlistResponse {
    private Long wishlistId;
    private Long userId;
    private List<WishlistItemResponse> items;
}
