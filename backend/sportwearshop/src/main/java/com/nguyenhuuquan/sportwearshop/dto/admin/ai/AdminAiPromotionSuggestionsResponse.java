package com.nguyenhuuquan.sportwearshop.dto.admin.ai;

import java.util.List;

public record AdminAiPromotionSuggestionsResponse(
        String summary,
        List<AdminAiPromotionSuggestionResponse> suggestions,
        String source
) {
}
