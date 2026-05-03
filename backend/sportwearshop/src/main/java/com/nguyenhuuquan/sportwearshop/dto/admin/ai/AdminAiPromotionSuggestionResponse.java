package com.nguyenhuuquan.sportwearshop.dto.admin.ai;

public record AdminAiPromotionSuggestionResponse(
        Long productId,
        String productName,
        String category,
        String brand,
        String sport,
        Integer totalStock,
        Integer productAgeDays,
        String productLifecycleStatus,
        Boolean ageRuleApplied,
        String ageRuleWarning,
        Integer soldLast30Days,
        Double revenueLast30Days,
        Integer suggestedDiscountPercent,
        Integer originalSuggestedDiscountPercent,
        Integer maxAllowedDiscountPercent,
        Double minProfitPerUnitAfterDiscount,
        Double minProfitMarginPercentAfterDiscount,
        Boolean profitProtected,
        Boolean discountAdjusted,
        String profitWarning,
        String priority,
        Double score,
        Boolean hasActivePromotion,
        String reason,
        String expectedImpact,
        String suggestedCampaignName
) {
}
