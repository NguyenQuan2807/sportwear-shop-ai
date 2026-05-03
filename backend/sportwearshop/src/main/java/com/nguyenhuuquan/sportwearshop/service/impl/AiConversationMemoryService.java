package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatMessageDto;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchCandidateResponse;
import com.nguyenhuuquan.sportwearshop.entity.AiConversation;
import com.nguyenhuuquan.sportwearshop.entity.AiMessage;
import com.nguyenhuuquan.sportwearshop.entity.AiSuggestedProduct;
import com.nguyenhuuquan.sportwearshop.repository.AiConversationRepository;
import com.nguyenhuuquan.sportwearshop.repository.AiMessageRepository;
import com.nguyenhuuquan.sportwearshop.repository.AiSuggestedProductRepository;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AiConversationMemoryService {

    private final AiConversationRepository aiConversationRepository;
    private final AiMessageRepository aiMessageRepository;
    private final AiSuggestedProductRepository aiSuggestedProductRepository;

    public AiConversationMemoryService(AiConversationRepository aiConversationRepository,
                                       AiMessageRepository aiMessageRepository,
                                       AiSuggestedProductRepository aiSuggestedProductRepository) {
        this.aiConversationRepository = aiConversationRepository;
        this.aiMessageRepository = aiMessageRepository;
        this.aiSuggestedProductRepository = aiSuggestedProductRepository;
    }

    @Transactional
    public AiConversation resolveConversation(Long conversationId, String sessionId) {
        if (conversationId != null) {
            return aiConversationRepository.findById(conversationId)
                    .orElseGet(() -> createConversation(sessionId));
        }

        if (AiTextNormalizer.hasText(sessionId)) {
            return aiConversationRepository.findTopBySessionIdOrderByUpdatedAtDesc(sessionId.trim())
                    .orElseGet(() -> createConversation(sessionId));
        }

        return createConversation(null);
    }

    @Transactional(readOnly = true)
    public List<AiChatMessageDto> loadHistory(AiConversation conversation,
                                              List<AiChatMessageDto> clientHistory,
                                              int maxHistory) {
        int safeLimit = Math.max(1, maxHistory);

        if (conversation != null && conversation.getId() != null) {
            List<AiMessage> messages = aiMessageRepository.findRecentMessages(
                    conversation.getId(),
                    PageRequest.of(0, safeLimit)
            );

            if (!messages.isEmpty()) {
                List<AiMessage> ordered = new ArrayList<>(messages);
                Collections.reverse(ordered);
                return ordered.stream()
                        .map(message -> new AiChatMessageDto(message.getRole(), message.getContent()))
                        .toList();
            }
        }

        if (clientHistory == null || clientHistory.isEmpty()) {
            return List.of();
        }

        return clientHistory.stream()
                .filter(item -> item != null && AiTextNormalizer.hasText(item.content()))
                .skip(Math.max(0, clientHistory.size() - safeLimit))
                .toList();
    }

    @Transactional
    public AiMessage saveMessage(AiConversation conversation, String role, String content) {
        AiMessage message = new AiMessage();
        message.setConversation(conversation);
        message.setRole(role);
        message.setContent(content);
        return aiMessageRepository.save(message);
    }

    @Transactional
    public void saveSuggestions(AiConversation conversation,
                                AiMessage assistantMessage,
                                List<ProductAiSearchCandidateResponse> candidates) {
        if (conversation == null || assistantMessage == null || candidates == null || candidates.isEmpty()) {
            return;
        }

        int rank = 1;
        for (ProductAiSearchCandidateResponse candidate : candidates.stream().limit(5).toList()) {
            if (candidate == null || candidate.productId() == null) {
                continue;
            }

            AiSuggestedProduct suggestedProduct = new AiSuggestedProduct();
            suggestedProduct.setConversation(conversation);
            suggestedProduct.setMessage(assistantMessage);
            suggestedProduct.setProductId(candidate.productId());
            suggestedProduct.setProductName(candidate.name());
            suggestedProduct.setRankOrder(rank++);
            suggestedProduct.setReason(candidate.reason());
            aiSuggestedProductRepository.save(suggestedProduct);
        }
    }

    @Transactional(readOnly = true)
    public List<AiSuggestedProduct> getLatestSuggestedProducts(AiConversation conversation) {
        if (conversation == null || conversation.getId() == null) {
            return List.of();
        }

        return aiSuggestedProductRepository.findLatestSuggestedProducts(conversation.getId());
    }

    private AiConversation createConversation(String sessionId) {
        AiConversation conversation = new AiConversation();
        if (AiTextNormalizer.hasText(sessionId)) {
            conversation.setSessionId(sessionId.trim());
        }
        conversation.setStatus("ACTIVE");
        return aiConversationRepository.save(conversation);
    }
}
