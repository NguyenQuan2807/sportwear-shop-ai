package com.nguyenhuuquan.sportwearshop.dto.product;

import com.nguyenhuuquan.sportwearshop.dto.promotion.AppliedPromotionInfoResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantResponse {
    private Long id;
    private String size;
    private String color;

    private Double price;
    private Double originalPrice;
    private Double finalPrice;
    private Double discountAmount;
    private Integer discountPercent;
    private Boolean onPromotion;
    private Boolean flashSale;
    private AppliedPromotionInfoResponse appliedPromotion;

    private Integer stockQuantity;
    private String sku;
}