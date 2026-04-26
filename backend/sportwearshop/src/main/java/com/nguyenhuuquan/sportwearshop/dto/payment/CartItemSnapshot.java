package com.nguyenhuuquan.sportwearshop.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemSnapshot {
    private Long productVariantId;
    private Integer quantity;
    private Double originalPrice;
    private Double finalPrice;
    private Double discountAmount;
    private String promotionName;
}
