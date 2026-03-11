package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;

public interface PromotionPricingService {
    VariantPricingResponse calculateVariantPricing(ProductVariant variant);
}