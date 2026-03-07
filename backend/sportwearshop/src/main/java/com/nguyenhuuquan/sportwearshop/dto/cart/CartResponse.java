package com.nguyenhuuquan.sportwearshop.dto.cart;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CartResponse {
    private Long cartId;
    private Long userId;
    private List<CartItemResponse> items;
    private Double totalAmount;
}