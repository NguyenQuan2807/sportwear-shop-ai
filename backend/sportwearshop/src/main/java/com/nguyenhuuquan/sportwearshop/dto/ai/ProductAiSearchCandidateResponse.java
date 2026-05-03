package com.nguyenhuuquan.sportwearshop.dto.ai;

import java.util.List;

public record ProductAiSearchCandidateResponse(
        Long productId,
        String name,
        String brand,
        String category,
        String sport,
        String gender,
        String thumbnailUrl,
        String productUrl,
        String priceLabel,
        Boolean inStock,
        Boolean onPromotion,
        String sizes,
        String colors,
        Integer score,
        String reason,
        List<String> scoreReasons
) {
}
