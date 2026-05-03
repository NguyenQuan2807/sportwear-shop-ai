package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatMessageDto;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchDebugResponse;

import java.util.List;

public interface ProductAiSearchService {
    ProductAiSearchDebugResponse search(String message, List<AiChatMessageDto> history, int limit);
}
