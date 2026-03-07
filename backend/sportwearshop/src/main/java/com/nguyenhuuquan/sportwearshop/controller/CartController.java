package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.cart.AddToCartRequest;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.UpdateCartItemRequest;
import com.nguyenhuuquan.sportwearshop.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getMyCart(Authentication authentication) {
        return cartService.getMyCart(authentication.getName());
    }

    @PostMapping("/items")
    public CartResponse addToCart(Authentication authentication,
                                  @Valid @RequestBody AddToCartRequest request) {
        return cartService.addToCart(authentication.getName(), request);
    }

    @PutMapping("/items/{cartItemId}")
    public CartResponse updateCartItem(Authentication authentication,
                                       @PathVariable Long cartItemId,
                                       @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateCartItem(authentication.getName(), cartItemId, request);
    }

    @DeleteMapping("/items/{cartItemId}")
    public String removeCartItem(Authentication authentication,
                                 @PathVariable Long cartItemId) {
        cartService.removeCartItem(authentication.getName(), cartItemId);
        return "Xóa sản phẩm khỏi giỏ hàng thành công";
    }
}