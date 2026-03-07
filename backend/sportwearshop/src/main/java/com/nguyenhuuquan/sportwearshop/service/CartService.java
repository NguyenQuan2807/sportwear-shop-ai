package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.cart.AddToCartRequest;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.UpdateCartItemRequest;

public interface CartService {
    CartResponse getMyCart(String email);
    CartResponse addToCart(String email, AddToCartRequest request);
    CartResponse updateCartItem(String email, Long cartItemId, UpdateCartItemRequest request);
    void removeCartItem(String email, Long cartItemId);
}