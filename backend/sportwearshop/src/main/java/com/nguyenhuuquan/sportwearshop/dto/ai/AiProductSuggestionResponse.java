package com.nguyenhuuquan.sportwearshop.dto.ai;

public record AiProductSuggestionResponse(
        Long id,
        String name,
        String thumbnailUrl,
        String productUrl,
        String priceLabel,
        String reason,
        String sizes,
        String colors
) {
}
