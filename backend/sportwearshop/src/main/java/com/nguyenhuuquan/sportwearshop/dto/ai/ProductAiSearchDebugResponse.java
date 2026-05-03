package com.nguyenhuuquan.sportwearshop.dto.ai;

import java.util.List;

public record ProductAiSearchDebugResponse(
        ProductAiParsedIntentResponse intent,
        List<ProductAiSearchCandidateResponse> results,
        String note
) {
}
