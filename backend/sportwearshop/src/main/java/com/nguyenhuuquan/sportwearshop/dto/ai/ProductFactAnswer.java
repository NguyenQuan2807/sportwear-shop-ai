package com.nguyenhuuquan.sportwearshop.dto.ai;

import java.util.List;

public record ProductFactAnswer(
        String reply,
        List<AiProductSuggestionResponse> suggestions
) {
}
