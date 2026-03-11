package com.nguyenhuuquan.sportwearshop.dto.promotion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantPricingResponse {
    private Double originalPrice;
    private Double finalPrice;
    private Double discountAmount;
    private Integer discountPercent;
    private Boolean onPromotion;
    private Boolean flashSale;
    private AppliedPromotionInfoResponse appliedPromotion;
}