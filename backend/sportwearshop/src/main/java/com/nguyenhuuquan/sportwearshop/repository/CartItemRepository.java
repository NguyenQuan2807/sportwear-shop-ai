package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.Cart;
import com.nguyenhuuquan.sportwearshop.entity.CartItem;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
    Optional<CartItem> findByCartAndProductVariant(Cart cart, ProductVariant productVariant);
}