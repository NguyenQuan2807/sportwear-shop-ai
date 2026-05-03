package com.nguyenhuuquan.sportwearshop.dto.ai;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;

import java.util.List;

public record ProductAiParsedIntentResponse(
        String rawMessage,
        boolean shouldSearchProducts,
        String categoryGroup,
        Gender gender,
        Double minPrice,
        Double maxPrice,
        String brand,
        List<String> sportTerms,
        List<String> featureTerms,
        String size,
        String color,
        boolean wantsPromotion,
        List<String> keywordTokens
) {
}
