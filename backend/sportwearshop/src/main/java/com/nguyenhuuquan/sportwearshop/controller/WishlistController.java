package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.wishlist.AddToWishlistRequest;
import com.nguyenhuuquan.sportwearshop.dto.wishlist.WishlistResponse;
import com.nguyenhuuquan.sportwearshop.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public WishlistResponse getMyWishlist(Authentication authentication) {
        return wishlistService.getMyWishlist(authentication.getName());
    }

    @PostMapping("/items")
    public WishlistResponse addToWishlist(Authentication authentication,
                                          @Valid @RequestBody AddToWishlistRequest request) {
        return wishlistService.addToWishlist(authentication.getName(), request);
    }

    @DeleteMapping("/items/{productId}")
    public WishlistResponse removeFromWishlist(Authentication authentication,
                                               @PathVariable Long productId) {
        return wishlistService.removeFromWishlist(authentication.getName(), productId);
    }
}
