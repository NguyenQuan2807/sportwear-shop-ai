package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatMessageDto;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatRequest;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiProductSuggestionResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchCandidateResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchDebugResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductFactAnswer;
import com.nguyenhuuquan.sportwearshop.entity.AiConversation;
import com.nguyenhuuquan.sportwearshop.entity.AiMessage;
import com.nguyenhuuquan.sportwearshop.service.AiChatService;
import com.nguyenhuuquan.sportwearshop.service.ProductAiSearchService;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatServiceImpl.class);

    private static final String SHOP_KNOWLEDGE = """
            Bạn là Sportwear AI - trợ lý tư vấn của Sportwear Shop.
            Phạm vi hỗ trợ:
            - Tư vấn sản phẩm thể thao theo nhu cầu, ngân sách, môn thể thao, size, màu, brand.
            - Trả lời thông tin sản phẩm theo dữ liệu thật từ database: giá, size, màu, tồn kho, khuyến mãi.
            - Hướng dẫn đặt hàng: chọn sản phẩm, chọn size/màu, thêm vào giỏ hàng, checkout.
            - Thanh toán: khách xem phương thức thanh toán ở bước checkout.
            - Giao hàng: thời gian phụ thuộc địa chỉ và đơn vị vận chuyển.
            - Đơn hàng: khách kiểm tra trong mục Đơn hàng hoặc liên hệ shop với mã đơn.
            Không bịa sản phẩm, giá, size, màu, tồn kho, khuyến mãi hoặc trạng thái đơn hàng.
            """;

    private final ProductAiSearchService productAiSearchService;
    private final AiConversationMemoryService aiConversationMemoryService;
    private final ProductFactAnswerService productFactAnswerService;
    private final RestClient restClient;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.max-history:8}")
    private int maxHistory;

    /*
     * Mặc định false để tiết kiệm quota.
     * Khi false: Gemini chỉ dùng trong ProductAiSearchServiceImpl để rerank sản phẩm.
     * AiChatServiceImpl sẽ viết câu trả lời bằng template thông minh từ kết quả đã rerank.
     * Nếu muốn gọi Gemini thêm lần nữa để viết văn phong tự nhiên hơn, đặt:
     * app.ai.answer-with-gemini=true
     */
    @Value("${app.ai.answer-with-gemini:false}")
    private boolean answerWithGemini;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${app.ai.gemini.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public AiChatServiceImpl(ProductAiSearchService productAiSearchService,
                             AiConversationMemoryService aiConversationMemoryService,
                             ProductFactAnswerService productFactAnswerService) {
        this.productAiSearchService = productAiSearchService;
        this.aiConversationMemoryService = aiConversationMemoryService;
        this.productFactAnswerService = productFactAnswerService;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        String message = sanitize(request.message());

        AiConversation conversation = aiConversationMemoryService.resolveConversation(
                request.conversationId(),
                request.sessionId()
        );

        List<AiChatMessageDto> history = aiConversationMemoryService.loadHistory(
                conversation,
                request.history(),
                maxHistory
        );

        aiConversationMemoryService.saveMessage(conversation, "user", message);

        Optional<ProductFactAnswer> factAnswer = productFactAnswerService.tryAnswer(message, conversation);
        if (factAnswer.isPresent()) {
            ProductFactAnswer answer = factAnswer.get();
            aiConversationMemoryService.saveMessage(conversation, "assistant", answer.reply());
            return new AiChatResponse(conversation.getId(), answer.reply(), answer.suggestions());
        }

        ProductAiSearchDebugResponse searchResult = productAiSearchService.search(message, history, 5);
        List<ProductAiSearchCandidateResponse> candidates = searchResult.results();

        String reply = null;
        if (answerWithGemini && aiEnabled && AiTextNormalizer.hasText(geminiApiKey)) {
            reply = askGemini(buildPrompt(message, history, searchResult));
        }

        if (!AiTextNormalizer.hasText(reply)) {
            reply = buildSmartLocalReply(message, searchResult);
        }

        List<AiProductSuggestionResponse> suggestions = searchResult.intent().shouldSearchProducts()
                ? candidates.stream()
                .limit(4)
                .map(this::toSuggestionResponse)
                .toList()
                : List.of();

        AiMessage assistantMessage = aiConversationMemoryService.saveMessage(conversation, "assistant", reply);

        if (searchResult.intent().shouldSearchProducts() && !candidates.isEmpty()) {
            aiConversationMemoryService.saveSuggestions(conversation, assistantMessage, candidates);
        }

        return new AiChatResponse(conversation.getId(), reply, suggestions);
    }

    private AiProductSuggestionResponse toSuggestionResponse(ProductAiSearchCandidateResponse candidate) {
        return new AiProductSuggestionResponse(
                candidate.productId(),
                candidate.name(),
                candidate.thumbnailUrl(),
                candidate.productUrl(),
                candidate.priceLabel(),
                candidate.reason(),
                candidate.sizes(),
                candidate.colors()
        );
    }

    private String buildPrompt(String message,
                               List<AiChatMessageDto> history,
                               ProductAiSearchDebugResponse searchResult) {
        return """
                %s

                Nguyên tắc trả lời:
                - Trả lời bằng tiếng Việt tự nhiên, giống nhân viên tư vấn thương mại điện tử.
                - Dựa vào Product search và dữ liệu thật trong prompt.
                - Nếu product search có kết quả, hãy chọn 2-3 sản phẩm phù hợp nhất và giải thích ngắn vì sao hợp.
                - Nếu khách hỏi size/sz/kích cỡ/màu/giá/tồn kho của sản phẩm vừa được tư vấn, hãy trả lời trực tiếp bằng dữ liệu trong Product search.
                - Không nói "không có thông tin size" nếu Product search đã có trường Size.
                - Nếu product search không có kết quả, nói rõ chưa tìm thấy sản phẩm đủ khớp và hỏi thêm đúng 1 câu để lọc lại.
                - Nếu câu hỏi không phải tìm sản phẩm, không gợi ý sản phẩm.
                - Không bịa sản phẩm ngoài danh sách product search.
                - Không dùng bảng, không trả JSON.

                Lịch sử chat gần đây:
                %s

                Tin nhắn hiện tại:
                %s

                Intent/search đã phân tích:
                %s

                Kết quả product search:
                %s
                """.formatted(
                SHOP_KNOWLEDGE,
                buildHistoryText(history),
                message,
                searchResult.intent(),
                buildProductContext(searchResult)
        );
    }

    private String buildProductContext(ProductAiSearchDebugResponse searchResult) {
        if (searchResult.results() == null || searchResult.results().isEmpty()) {
            return "(Không có sản phẩm đủ khớp.) Ghi chú: " + searchResult.note();
        }

        return searchResult.results().stream()
                .limit(5)
                .map(candidate -> """
                        - Score: %s
                          ID: %s
                          Tên: %s
                          Brand: %s
                          Danh mục: %s
                          Môn thể thao: %s
                          Giới tính: %s
                          Giá: %s
                          Tồn kho: %s
                          Khuyến mãi: %s
                          Size: %s
                          Màu: %s
                          Lý do chọn: %s
                          Debug reasons: %s
                          Link: %s
                        """.formatted(
                        candidate.score(),
                        candidate.productId(),
                        candidate.name(),
                        candidate.brand(),
                        candidate.category(),
                        candidate.sport(),
                        candidate.gender(),
                        candidate.priceLabel(),
                        Boolean.TRUE.equals(candidate.inStock()) ? "Còn hàng" : "Có thể hết hàng",
                        Boolean.TRUE.equals(candidate.onPromotion()) ? "Có" : "Không",
                        AiTextNormalizer.hasText(candidate.sizes()) ? candidate.sizes() : "Chưa có dữ liệu size",
                        AiTextNormalizer.hasText(candidate.colors()) ? candidate.colors() : "Chưa có dữ liệu màu",
                        candidate.reason(),
                        String.join("; ", candidate.scoreReasons()),
                        candidate.productUrl()
                ))
                .collect(Collectors.joining("\n"));
    }

    private String askGemini(String prompt) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(geminiBaseUrl + "/" + geminiModel + ":generateContent")
                    .queryParam("key", geminiApiKey)
                    .build()
                    .toUri();

            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", prompt))
                            )
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.45,
                            "topP", 0.9,
                            "maxOutputTokens", 700
                    )
            );

            Map<String, Object> response = restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            return extractGeminiText(response);
        } catch (Exception exception) {
            log.warn("Gemini answer request failed, fallback to local answer.", exception);
            return null;
        }
    }

    private String extractGeminiText(Map<String, Object> response) {
        if (response == null) {
            return null;
        }

        Object candidatesObject = response.get("candidates");
        if (!(candidatesObject instanceof List<?> candidates) || candidates.isEmpty()) {
            return null;
        }

        Object firstCandidate = candidates.get(0);
        if (!(firstCandidate instanceof Map<?, ?> candidateMap)) {
            return null;
        }

        Object contentObject = candidateMap.get("content");
        if (!(contentObject instanceof Map<?, ?> contentMap)) {
            return null;
        }

        Object partsObject = contentMap.get("parts");
        if (!(partsObject instanceof List<?> parts) || parts.isEmpty()) {
            return null;
        }

        StringBuilder builder = new StringBuilder();
        for (Object part : parts) {
            if (part instanceof Map<?, ?> partMap) {
                Object textObject = partMap.get("text");
                if (textObject instanceof String text && AiTextNormalizer.hasText(text)) {
                    builder.append(text.trim()).append("\n");
                }
            }
        }

        String text = builder.toString().trim();
        return AiTextNormalizer.hasText(text) ? text : null;
    }

    private String buildSmartLocalReply(String message, ProductAiSearchDebugResponse searchResult) {
        String normalized = AiTextNormalizer.normalize(message);

        if (!searchResult.intent().shouldSearchProducts()) {
            return buildNonProductReply(normalized);
        }

        if (searchResult.results().isEmpty()) {
            return "Mình chưa tìm thấy sản phẩm đủ khớp với yêu cầu này. Bạn cho mình biết rõ hơn loại sản phẩm, môn thể thao, brand hoặc ngân sách để mình lọc chính xác hơn nhé.";
        }

        List<ProductAiSearchCandidateResponse> topProducts = searchResult.results().stream()
                .limit(3)
                .toList();

        StringBuilder builder = new StringBuilder();
        builder.append("Mình tìm được vài lựa chọn phù hợp nhất cho bạn:\n");

        for (int index = 0; index < topProducts.size(); index++) {
            ProductAiSearchCandidateResponse candidate = topProducts.get(index);
            builder.append(index + 1)
                    .append(". ")
                    .append(candidate.name());

            if (AiTextNormalizer.hasText(candidate.priceLabel())) {
                builder.append(" — ").append(candidate.priceLabel());
            }

            builder.append(". ");

            if (AiTextNormalizer.hasText(candidate.reason())) {
                builder.append(candidate.reason()).append(". ");
            }

            if (AiTextNormalizer.hasText(candidate.sizes())) {
                builder.append("Size hiện có: ").append(candidate.sizes()).append(". ");
            }

            if (AiTextNormalizer.hasText(candidate.colors())) {
                builder.append("Màu: ").append(candidate.colors()).append(". ");
            }

            builder.append("\n");
        }

        builder.append("Bạn có thể hỏi tiếp kiểu: \"mẫu đầu tiên còn size 42 không?\", \"đôi đó có màu gì?\" hoặc \"so sánh 2 mẫu đầu cho mình\".");
        return builder.toString().trim();
    }

    private String buildNonProductReply(String normalized) {
        if (normalized.contains("chao") || normalized.contains("hello") || normalized.contains("hi")) {
            return "Chào bạn, mình là Sportwear AI. Mình có thể tư vấn giày, áo, quần, phụ kiện thể thao theo môn tập, ngân sách, size, màu hoặc thương hiệu bạn thích.";
        }

        if (normalized.contains("size") || normalized.contains("sz") || normalized.contains("chon size") || normalized.contains("mac size") || normalized.contains("kich co")) {
            return "Bạn đang hỏi size của sản phẩm nào? Nếu là mẫu mình vừa gợi ý, bạn có thể hỏi như: \"mẫu đầu tiên còn size 42 không?\" để mình kiểm tra chính xác.";
        }

        if (normalized.contains("thanh toan") || normalized.contains("payment") || normalized.contains("qr")) {
            return "Bạn có thể xem các phương thức thanh toán ở bước checkout. Nếu thanh toán QR lỗi, bạn thử kiểm tra lại đơn hoặc tạo lại mã thanh toán nhé.";
        }

        if (normalized.contains("giao hang") || normalized.contains("ship")) {
            return "Thời gian giao hàng phụ thuộc địa chỉ nhận và đơn vị vận chuyển. Sau khi đặt hàng, bạn có thể theo dõi trong mục Đơn hàng.";
        }

        if (normalized.contains("doi tra") || normalized.contains("bao hanh")) {
            return "Về đổi trả hoặc bảo hành, bạn nên kiểm tra chính sách hiển thị trong trang shop hoặc liên hệ shop kèm mã đơn để được xử lý chính xác.";
        }

        return "Mình có thể hỗ trợ bạn chọn sản phẩm, tư vấn size, gợi ý đồ theo ngân sách hoặc hướng dẫn đặt hàng. Bạn muốn mình hỗ trợ phần nào?";
    }

    private String buildHistoryText(List<AiChatMessageDto> history) {
        if (history == null || history.isEmpty()) {
            return "(chưa có)";
        }

        int safeMaxHistory = Math.max(1, maxHistory);
        return history.stream()
                .filter(item -> item != null && AiTextNormalizer.hasText(item.content()))
                .skip(Math.max(0, history.size() - safeMaxHistory))
                .map(item -> {
                    String role = "user".equalsIgnoreCase(item.role()) ? "Khách" : "AI";
                    return role + ": " + sanitize(item.content());
                })
                .collect(Collectors.joining("\n"));
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replaceAll("[\\u0000-\\u001F]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
