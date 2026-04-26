package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatRequest;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatResponse;

public interface AiChatService {

    AiChatResponse chat(AiChatRequest request);
}
