package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.wishlist.AddToWishlistRequest;
import com.nguyenhuuquan.sportwearshop.dto.wishlist.WishlistResponse;

public interface WishlistService {
    WishlistResponse getMyWishlist(String email);
    WishlistResponse addToWishlist(String email, AddToWishlistRequest request);
    WishlistResponse removeFromWishlist(String email, Long productId);
}
