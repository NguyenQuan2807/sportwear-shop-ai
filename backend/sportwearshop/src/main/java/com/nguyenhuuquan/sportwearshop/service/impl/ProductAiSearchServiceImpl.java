package com.nguyenhuuquan.sportwearshop.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatMessageDto;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiParsedIntentResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchCandidateResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductAiSearchDebugResponse;
import com.nguyenhuuquan.sportwearshop.entity.ProductAiDocument;
import com.nguyenhuuquan.sportwearshop.repository.ProductAiDocumentRepository;
import com.nguyenhuuquan.sportwearshop.service.ProductAiIndexService;
import com.nguyenhuuquan.sportwearshop.service.ProductAiSearchService;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductAiSearchServiceImpl implements ProductAiSearchService {

    private static final Logger log = LoggerFactory.getLogger(ProductAiSearchServiceImpl.class);

    /*
     * Bản LLM Reranker:
     * - Rule chỉ parse intent cơ bản và lấy candidate rộng.
     * - Gemini sẽ xếp hạng lại các sản phẩm thật trong database.
     * - Gemini chỉ được chọn productId có trong candidate list, không được bịa sản phẩm.
     */
    private static final int DB_CANDIDATE_LIMIT = 300;
    private static final int RERANK_CANDIDATE_LIMIT = 40;

    private static final Set<String> STOP_WORDS = Collections.unmodifiableSet(new LinkedHashSet<>(List.of(
            "toi", "minh", "em", "anh", "chi", "ban", "shop", "can", "muon", "mua", "tim", "kiem",
            "goi", "y", "tu", "van", "cho", "giup", "voi", "san", "pham", "hang", "loai", "mau",
            "co", "khong", "nao", "phu", "hop", "tot", "dep", "re", "gia", "khoang",
            "duoi", "tren", "den", "toi", "da", "qua", "nho", "hon", "lon",
            "trieu", "tr", "m", "k", "nghin", "ngan", "vnd", "dong", "d",
            "nam", "nu", "unisex", "male", "female", "men", "women", "woman", "man",
            "ao", "quan", "giay", "dep", "phu", "kien", "sale", "discount", "giam", "khuyen", "mai",
            "size", "mau", "color", "colour", "the", "thao", "mac", "di", "tap"
    )));

    private final ProductAiDocumentRepository productAiDocumentRepository;
    private final ProductAiIndexService productAiIndexService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${app.ai.gemini.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public ProductAiSearchServiceImpl(ProductAiDocumentRepository productAiDocumentRepository,
                                      ProductAiIndexService productAiIndexService) {
        this.productAiDocumentRepository = productAiDocumentRepository;
        this.productAiIndexService = productAiIndexService;
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public ProductAiSearchDebugResponse search(String message, List<AiChatMessageDto> history, int limit) {
        ensureIndexReady();

        String historyText = buildHistoryText(history);
        ProductAiParsedIntentResponse intent = parseIntent(message, historyText);

        if (!intent.shouldSearchProducts()) {
            return new ProductAiSearchDebugResponse(
                    intent,
                    List.of(),
                    "Tin nhắn này không phải nhu cầu tìm sản phẩm, nên không chạy product search."
            );
        }

        List<ProductAiDocument> dbCandidates = queryBroadCandidates(intent);

        if (dbCandidates.isEmpty()) {
            return new ProductAiSearchDebugResponse(
                    intent,
                    List.of(),
                    "Không có sản phẩm active trong product_ai_documents. Hãy rebuild index và kiểm tra dữ liệu sản phẩm."
            );
        }

        List<ScoredDocument> preRanked = dbCandidates.stream()
                .map(document -> new ScoredDocument(document, ruleScore(document, intent)))
                .sorted(Comparator.comparingInt(ScoredDocument::score).reversed())
                .limit(RERANK_CANDIDATE_LIMIT)
                .toList();

        List<ProductAiSearchCandidateResponse> results;

        boolean canUseGemini = aiEnabled && AiTextNormalizer.hasText(geminiApiKey);

        if (canUseGemini) {
            results = rerankWithGemini(message, historyText, intent, preRanked, Math.max(1, limit));
            if (!results.isEmpty()) {
                return new ProductAiSearchDebugResponse(
                        intent,
                        results,
                        "Đã dùng Gemini reranker để chọn sản phẩm từ danh sách productId thật trong database."
                );
            }
        }

        results = preRanked.stream()
                .filter(item -> item.score() >= minimumRuleScore(intent))
                .limit(Math.max(1, limit))
                .map(item -> toCandidate(item.document(), item.score(), "Rule fallback", buildRuleReasons(item.document(), intent)))
                .toList();

        String note = canUseGemini
                ? "Gemini reranker không trả được JSON hợp lệ hoặc không chọn được sản phẩm, đã fallback về rule scoring."
                : "Chưa có GEMINI_API_KEY hoặc app.ai.enabled=false, đang dùng rule scoring fallback. Muốn thông minh hơn bắt buộc cần bật Gemini.";

        return new ProductAiSearchDebugResponse(intent, results, note);
    }

    private void ensureIndexReady() {
        if (productAiDocumentRepository.count() == 0) {
            productAiIndexService.rebuildIndex();
        }
    }

    private List<ProductAiDocument> queryBroadCandidates(ProductAiParsedIntentResponse intent) {
        Specification<ProductAiDocument> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("productActive")));

            /*
             * Chỉ filter cực mềm theo giá/tồn kho.
             * Không filter cứng category/gender nữa vì nhiều database đặt category/sport chưa chuẩn.
             * Category/gender/brand/sport sẽ để Gemini rerank quyết định.
             */
            if (intent.maxPrice() != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("minPrice")),
                        cb.lessThanOrEqualTo(root.<Double>get("minPrice"), intent.maxPrice() * 1.80)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<ProductAiDocument> results = productAiDocumentRepository.findAll(
                specification,
                PageRequest.of(0, DB_CANDIDATE_LIMIT, Sort.by(Sort.Direction.DESC, "updatedAt"))
        ).getContent();

        if (!results.isEmpty()) {
            return results;
        }

        return productAiDocumentRepository.findAll(
                (root, query, cb) -> cb.isTrue(root.get("productActive")),
                PageRequest.of(0, DB_CANDIDATE_LIMIT, Sort.by(Sort.Direction.DESC, "updatedAt"))
        ).getContent();
    }

    private List<ProductAiSearchCandidateResponse> rerankWithGemini(String message,
                                                                    String historyText,
                                                                    ProductAiParsedIntentResponse intent,
                                                                    List<ScoredDocument> candidates,
                                                                    int limit) {
        try {
            String prompt = buildRerankPrompt(message, historyText, intent, candidates, limit);

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
                            "temperature", 0.15,
                            "topP", 0.85,
                            "maxOutputTokens", 2200
                    )
            );

            Map<String, Object> response = restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            String text = extractGeminiText(response);
            List<LlmRerankItem> items = parseRerankItems(text);

            if (items.isEmpty()) {
                return List.of();
            }

            Map<Long, ProductAiDocument> documentByProductId = candidates.stream()
                    .map(ScoredDocument::document)
                    .filter(document -> document.getProductId() != null)
                    .collect(Collectors.toMap(ProductAiDocument::getProductId, document -> document, (a, b) -> a));

            Map<Long, Integer> ruleScoreByProductId = candidates.stream()
                    .filter(item -> item.document().getProductId() != null)
                    .collect(Collectors.toMap(item -> item.document().getProductId(), ScoredDocument::score, (a, b) -> a));

            return items.stream()
                    .filter(item -> item.productId() != null)
                    .filter(item -> documentByProductId.containsKey(item.productId()))
                    .filter(item -> item.score() == null || item.score() >= 45)
                    .sorted(Comparator.comparing((LlmRerankItem item) -> item.score() == null ? 0 : item.score()).reversed())
                    .limit(limit)
                    .map(item -> {
                        ProductAiDocument document = documentByProductId.get(item.productId());
                        int combinedScore = Math.max(
                                item.score() == null ? 0 : item.score(),
                                ruleScoreByProductId.getOrDefault(item.productId(), 0)
                        );
                        List<String> reasons = new ArrayList<>(buildRuleReasons(document, intent));
                        if (AiTextNormalizer.hasText(item.reason())) {
                            reasons.add(0, "Gemini: " + item.reason());
                        }
                        return toCandidate(document, combinedScore, item.reason(), reasons);
                    })
                    .toList();
        } catch (Exception exception) {
            log.warn("Gemini product rerank failed, fallback to rule scoring.", exception);
            return List.of();
        }
    }

    private String buildRerankPrompt(String message,
                                     String historyText,
                                     ProductAiParsedIntentResponse intent,
                                     List<ScoredDocument> candidates,
                                     int limit) {
        return """
                Bạn là Product Search Reranker cho website thương mại điện tử Sportwear Shop.

                Nhiệm vụ:
                - Đọc nhu cầu khách hàng.
                - Chọn tối đa %s sản phẩm phù hợp nhất từ danh sách candidate.
                - Chỉ được chọn productId có trong danh sách candidate.
                - Không được bịa sản phẩm.
                - Nếu không có sản phẩm đủ phù hợp, trả về [].
                - Ưu tiên đúng nhu cầu chính hơn là sản phẩm mới/có sale.
                - Nếu khách hỏi giày chạy bộ thì không chọn áo/quần/phụ kiện.
                - Nếu khách hỏi áo tập gym thì không chọn giày.
                - Nếu khách có ngân sách, sản phẩm vượt ngân sách nhiều phải bị loại.
                - Nếu khách hỏi size/kích cỡ của "sản phẩm đó/đôi giày đó/mẫu đó", hãy ưu tiên sản phẩm đã được nhắc trong lịch sử chat nếu nó nằm trong candidate.
                - Nếu khách hỏi size/màu/tồn kho, hãy chọn đúng sản phẩm liên quan nhất để hệ thống trả lời từ trường sizes/colors/inStock.
                - Nếu dữ liệu sản phẩm không ghi rõ "êm/thoáng/chạy bộ" nhưng category/sport/material/description có dấu hiệu phù hợp, có thể chọn nhưng phải giảm điểm.
                - Trả về DUY NHẤT JSON array, không markdown, không giải thích ngoài JSON.

                Format bắt buộc:
                [
                  {
                    "productId": 123,
                    "score": 92,
                    "reason": "Đúng giày chạy bộ nam, giá trong ngân sách, có tag êm chân/thoáng khí"
                  }
                ]

                Lịch sử chat:
                %s

                Tin nhắn hiện tại:
                %s

                Intent rule đã phân tích:
                %s

                Candidate products:
                %s
                """.formatted(
                limit,
                AiTextNormalizer.hasText(historyText) ? historyText : "(không có)",
                message,
                intent,
                buildCandidateText(candidates)
        );
    }

    private String buildCandidateText(List<ScoredDocument> candidates) {
        return candidates.stream()
                .map(item -> {
                    ProductAiDocument document = item.document();
                    return """
                            productId: %s
                            ruleScore: %s
                            name: %s
                            brand: %s
                            category: %s
                            categoryGroup: %s
                            sport: %s
                            gender: %s
                            price: %s
                            minPrice: %s
                            inStock: %s
                            onPromotion: %s
                            sizes: %s
                            colors: %s
                            material: %s
                            features: %s
                            useCases: %s
                            aiTags: %s
                            description: %s
                            searchText: %s
                            ---
                            """.formatted(
                            document.getProductId(),
                            item.score(),
                            nullToBlank(document.getProductName()),
                            nullToBlank(document.getBrandName()),
                            nullToBlank(document.getCategoryName()),
                            nullToBlank(document.getCategoryGroup()),
                            nullToBlank(document.getSportName()),
                            document.getGender() == null ? "" : document.getGender().name(),
                            nullToBlank(document.getPriceLabel()),
                            document.getMinPrice(),
                            Boolean.TRUE.equals(document.getInStock()),
                            Boolean.TRUE.equals(document.getOnPromotion()),
                            nullToBlank(document.getSizes()),
                            nullToBlank(document.getColors()),
                            nullToBlank(document.getMaterial()),
                            nullToBlank(document.getFeatures()),
                            nullToBlank(document.getUseCases()),
                            nullToBlank(document.getAiTags()),
                            abbreviate(document.getDescription(), 300),
                            abbreviate(document.getSearchText(), 600)
                    );
                })
                .collect(Collectors.joining("\n"));
    }

    private List<LlmRerankItem> parseRerankItems(String text) {
        if (!AiTextNormalizer.hasText(text)) {
            return List.of();
        }

        String json = extractJsonArray(text);
        if (!AiTextNormalizer.hasText(json)) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception exception) {
            log.warn("Cannot parse Gemini rerank JSON: {}", json, exception);
            return List.of();
        }
    }

    private String extractJsonArray(String text) {
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');

        if (start < 0 || end <= start) {
            return null;
        }

        return text.substring(start, end + 1);
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

    private int ruleScore(ProductAiDocument document, ProductAiParsedIntentResponse intent) {
        int score = 0;
        String searchable = buildSearchable(document);

        if (Boolean.TRUE.equals(document.getInStock())) {
            score += 15;
        }

        if (AiTextNormalizer.hasText(intent.categoryGroup())) {
            if (intent.categoryGroup().equals(document.getCategoryGroup())) {
                score += 35;
            } else if (containsAnySearch(searchable, categorySynonyms(intent.categoryGroup()))) {
                score += 25;
            }
        }

        if (intent.gender() != null) {
            if (intent.gender() == document.getGender()) {
                score += 18;
            } else if (document.getGender() == Gender.UNISEX && intent.gender() != Gender.UNISEX) {
                score += 10;
            }
        }

        if (intent.maxPrice() != null && document.getMinPrice() != null) {
            if (document.getMinPrice() <= intent.maxPrice()) {
                score += 30;
            } else if (document.getMinPrice() <= intent.maxPrice() * 1.20) {
                score += 10;
            } else if (document.getMinPrice() > intent.maxPrice() * 1.50) {
                score -= 30;
            }
        }

        if (AiTextNormalizer.hasText(intent.brand())) {
            String brand = AiTextNormalizer.normalize(intent.brand());
            if (searchable.contains(brand)) {
                score += 35;
            }
        }

        for (String sportTerm : intent.sportTerms()) {
            if (containsSearchTerm(searchable, sportTerm)) {
                score += 18;
            }
        }

        for (String featureTerm : intent.featureTerms()) {
            if (containsSearchTerm(searchable, featureTerm)) {
                score += 14;
            }
        }

        if (AiTextNormalizer.hasText(intent.size()) && containsSearchTerm(AiTextNormalizer.normalize(document.getSizes()), intent.size())) {
            score += 12;
        }

        if (AiTextNormalizer.hasText(intent.color()) && containsSearchTerm(AiTextNormalizer.normalize(document.getColors()), intent.color())) {
            score += 12;
        }

        if (intent.wantsPromotion() && Boolean.TRUE.equals(document.getOnPromotion())) {
            score += 25;
        }

        for (String token : intent.keywordTokens()) {
            if (containsSearchTerm(searchable, token)) {
                score += 3;
            }
        }

        return score;
    }

    private int minimumRuleScore(ProductAiParsedIntentResponse intent) {
        int score = 20;

        if (AiTextNormalizer.hasText(intent.categoryGroup())) {
            score += 15;
        }

        if (intent.maxPrice() != null) {
            score += 5;
        }

        if (!intent.sportTerms().isEmpty()) {
            score += 5;
        }

        return score;
    }

    private List<String> buildRuleReasons(ProductAiDocument document, ProductAiParsedIntentResponse intent) {
        List<String> reasons = new ArrayList<>();
        String searchable = buildSearchable(document);

        if (Boolean.TRUE.equals(document.getInStock())) {
            reasons.add("Còn hàng");
        }

        if (AiTextNormalizer.hasText(intent.categoryGroup())) {
            if (intent.categoryGroup().equals(document.getCategoryGroup())) {
                reasons.add("Đúng nhóm danh mục: " + intent.categoryGroup());
            } else if (containsAnySearch(searchable, categorySynonyms(intent.categoryGroup()))) {
                reasons.add("Có dấu hiệu thuộc nhóm: " + intent.categoryGroup());
            }
        }

        if (intent.gender() != null) {
            if (intent.gender() == document.getGender()) {
                reasons.add("Đúng giới tính: " + intent.gender());
            } else if (document.getGender() == Gender.UNISEX) {
                reasons.add("Unisex, vẫn có thể phù hợp");
            }
        }

        if (intent.maxPrice() != null && document.getMinPrice() != null && document.getMinPrice() <= intent.maxPrice()) {
            reasons.add("Giá trong ngân sách");
        }

        if (AiTextNormalizer.hasText(intent.brand()) && searchable.contains(AiTextNormalizer.normalize(intent.brand()))) {
            reasons.add("Đúng thương hiệu: " + intent.brand());
        }

        if (!intent.sportTerms().isEmpty() && intent.sportTerms().stream().anyMatch(term -> containsSearchTerm(searchable, term))) {
            reasons.add("Có tag/mô tả phù hợp môn thể thao");
        }

        if (!intent.featureTerms().isEmpty() && intent.featureTerms().stream().anyMatch(term -> containsSearchTerm(searchable, term))) {
            reasons.add("Có đặc điểm phù hợp nhu cầu");
        }

        if (intent.wantsPromotion() && Boolean.TRUE.equals(document.getOnPromotion())) {
            reasons.add("Đang khuyến mãi");
        }

        if (reasons.isEmpty()) {
            reasons.add("Sản phẩm có mức độ liên quan gần nhất trong dữ liệu hiện tại");
        }

        return reasons;
    }

    private ProductAiSearchCandidateResponse toCandidate(ProductAiDocument document,
                                                         int score,
                                                         String reason,
                                                         List<String> scoreReasons) {
        return new ProductAiSearchCandidateResponse(
                document.getProductId(),
                document.getProductName(),
                document.getBrandName(),
                document.getCategoryName(),
                document.getSportName(),
                document.getGender() != null ? document.getGender().name() : null,
                document.getThumbnailUrl(),
                document.getProductUrl(),
                document.getPriceLabel(),
                document.getInStock(),
                document.getOnPromotion(),
                document.getSizes(),
                document.getColors(),
                score,
                AiTextNormalizer.hasText(reason) ? reason : String.join(", ", scoreReasons.stream().limit(4).toList()),
                scoreReasons
        );
    }

    private ProductAiParsedIntentResponse parseIntent(String message, String historyText) {
        String normalizedMessage = AiTextNormalizer.normalize(message);
        String normalizedContext = AiTextNormalizer.normalize(historyText + " " + message);

        Set<String> currentTokens = AiTextNormalizer.tokens(normalizedMessage);
        Set<String> contextTokens = AiTextNormalizer.tokens(normalizedContext);

        boolean isGreeting = AiTextNormalizer.containsAny(currentTokens, "hi", "hello", "hey", "chao", "alo")
                || normalizedMessage.matches("^(xin chao|chao shop|chao ban).*");

        boolean isThanks = AiTextNormalizer.containsAny(currentTokens, "camon", "thanks", "thank")
                || normalizedMessage.contains("cam on");

        boolean isPolicyQuestion = normalizedMessage.contains("thanh toan")
                || normalizedMessage.contains("giao hang")
                || normalizedMessage.contains("dat hang")
                || normalizedMessage.contains("doi tra")
                || normalizedMessage.contains("bao hanh")
                || normalizedMessage.contains("don hang")
                || AiTextNormalizer.containsAny(currentTokens, "ship", "shipping", "payment", "qr", "cod", "checkout");

        boolean asksSizeInfo = normalizedMessage.contains("size")
                || normalizedMessage.contains("sz")
                || normalizedMessage.contains("kich co")
                || normalizedMessage.contains("kich thuoc")
                || normalizedMessage.contains("co nao")
                || normalizedMessage.contains("co nhung size")
                || normalizedMessage.contains("bao nhieu size")
                || normalizedMessage.contains("bao nhieu sz")
                || AiTextNormalizer.containsAny(currentTokens, "size", "sz");

        boolean asksColorInfo = normalizedMessage.contains("mau nao")
                || normalizedMessage.contains("co mau")
                || normalizedMessage.contains("nhung mau")
                || AiTextNormalizer.containsAny(currentTokens, "mau", "color", "colour");

        boolean asksStockInfo = normalizedMessage.contains("con hang")
                || normalizedMessage.contains("het hang")
                || normalizedMessage.contains("co san")
                || normalizedMessage.contains("ton kho");

        boolean asksVariantInfo = asksSizeInfo || asksColorInfo || asksStockInfo;

        boolean isSizeAdviceOnlyQuestion = asksSizeInfo
                && (normalizedMessage.contains("cao") || normalizedMessage.contains("nang") || normalizedMessage.contains("kg") || normalizedMessage.contains("m7") || normalizedMessage.contains("m6"))
                && !AiTextNormalizer.containsAny(currentTokens, "mua", "tim", "goi", "y", "san", "pham", "ao", "quan", "giay", "dep");

        Double maxPrice = detectMaxPrice(normalizedMessage);
        if (maxPrice == null) {
            maxPrice = detectMaxPrice(normalizedContext);
        }

        Double minPrice = detectMinPrice(normalizedMessage);
        if (minPrice == null) {
            minPrice = detectMinPrice(normalizedContext);
        }

        String categoryGroup = detectCategoryGroup(normalizedContext, contextTokens);
        Gender gender = detectGender(contextTokens);
        String brand = detectBrand(contextTokens);
        List<String> sportTerms = new ArrayList<>(detectSportTerms(normalizedContext, contextTokens));
        List<String> featureTerms = new ArrayList<>(detectFeatureTerms(normalizedContext, contextTokens));
        String size = detectSize(currentTokens);
        String color = detectColor(currentTokens);

        boolean hasProductWords = categoryGroup != null
                || brand != null
                || !sportTerms.isEmpty()
                || AiTextNormalizer.containsAny(contextTokens,
                "ao", "quan", "giay", "dep", "phu", "kien", "balo", "tui", "mu", "tat",
                "sneaker", "shoes", "shirt", "pants", "hoodie", "jacket", "san", "pham");

        boolean hasBuyingWords = AiTextNormalizer.containsAny(currentTokens,
                "mua", "tim", "kiem", "goi", "y", "tu", "van", "chon", "can", "muon",
                "recommend", "suggest", "nen", "phu", "hop");

        boolean wantsPromotion = normalizedMessage.contains("giam gia")
                || normalizedMessage.contains("khuyen mai")
                || AiTextNormalizer.containsAny(currentTokens, "sale", "discount");

        boolean hasPrice = minPrice != null || maxPrice != null;

        boolean hasHistoryContext = AiTextNormalizer.hasText(historyText);

        boolean shouldSearch = !isGreeting
                && !isThanks
                && !isPolicyQuestion
                && !isSizeAdviceOnlyQuestion
                && (
                (hasProductWords && (hasBuyingWords || hasPrice || wantsPromotion || asksVariantInfo))
                        || hasPrice
                        || wantsPromotion
                        || (asksVariantInfo && hasHistoryContext)
        );

        Set<String> keywordTokens = contextTokens.stream()
                .filter(token -> token.length() > 1)
                .filter(token -> !STOP_WORDS.contains(token))
                .filter(token -> !token.matches("\\d+"))
                .filter(token -> brand == null || !token.equals(AiTextNormalizer.normalize(brand)))
                .limit(12)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new ProductAiParsedIntentResponse(
                message,
                shouldSearch,
                categoryGroup,
                gender,
                minPrice,
                maxPrice,
                brand,
                sportTerms,
                featureTerms,
                size,
                color,
                wantsPromotion,
                List.copyOf(keywordTokens)
        );
    }

    private String buildHistoryText(List<AiChatMessageDto> history) {
        if (history == null || history.isEmpty()) {
            return "";
        }

        return history.stream()
                .filter(item -> item != null && AiTextNormalizer.hasText(item.content()))
                .skip(Math.max(0, history.size() - 8))
                .map(AiChatMessageDto::content)
                .collect(Collectors.joining(" "));
    }

    private String buildSearchable(ProductAiDocument document) {
        return AiTextNormalizer.normalize(String.join(" ",
                nullToBlank(document.getSearchableText()),
                nullToBlank(document.getSearchText()),
                nullToBlank(document.getProductName()),
                nullToBlank(document.getBrandName()),
                nullToBlank(document.getCategoryName()),
                nullToBlank(document.getCategoryGroup()),
                nullToBlank(document.getSportName()),
                nullToBlank(document.getFeatures()),
                nullToBlank(document.getUseCases()),
                nullToBlank(document.getAiTags()),
                nullToBlank(document.getSizes()),
                nullToBlank(document.getColors()),
                nullToBlank(document.getMaterial()),
                nullToBlank(document.getDescription())
        ));
    }

    private boolean containsSearchTerm(String searchable, String rawTerm) {
        if (!AiTextNormalizer.hasText(searchable) || !AiTextNormalizer.hasText(rawTerm)) {
            return false;
        }

        String term = AiTextNormalizer.normalize(rawTerm);
        if (!AiTextNormalizer.hasText(term)) {
            return false;
        }

        return searchable.contains(term);
    }

    private boolean containsAnySearch(String searchable, Collection<String> terms) {
        for (String term : terms) {
            if (containsSearchTerm(searchable, term)) {
                return true;
            }
        }
        return false;
    }

    private Collection<String> categorySynonyms(String categoryGroup) {
        if ("shoes".equals(categoryGroup)) {
            return List.of("giay", "dep", "shoe", "shoes", "sneaker", "sneakers", "footwear");
        }

        if ("apparel".equals(categoryGroup)) {
            return List.of("ao", "quan", "shirt", "tee", "hoodie", "jacket", "short", "shorts", "pants", "apparel", "clothing");
        }

        if ("accessories".equals(categoryGroup)) {
            return List.of("phu kien", "balo", "tui", "mu", "tat", "vo", "bag", "accessory", "accessories");
        }

        return List.of();
    }

    private String detectCategoryGroup(String normalized, Set<String> tokens) {
        if (AiTextNormalizer.containsAny(tokens, "giay", "dep", "shoe", "shoes", "sneaker", "sneakers", "footwear")) {
            return "shoes";
        }

        if (AiTextNormalizer.containsAny(tokens, "ao", "quan", "shirt", "tee", "hoodie", "jacket", "short", "shorts", "pants", "apparel", "clothing")
                || normalized.contains("quan ao")
                || normalized.contains("do tap")
                || normalized.contains("do the thao")) {
            return "apparel";
        }

        if (normalized.contains("phu kien")
                || AiTextNormalizer.containsAny(tokens, "tui", "mu", "balo", "tat", "vo", "cap", "bag", "accessory", "accessories")) {
            return "accessories";
        }

        return null;
    }

    private Gender detectGender(Set<String> tokens) {
        if (AiTextNormalizer.containsAny(tokens, "nam", "male", "men", "man")) {
            return Gender.MALE;
        }

        if (AiTextNormalizer.containsAny(tokens, "nu", "female", "women", "woman")) {
            return Gender.FEMALE;
        }

        if (AiTextNormalizer.containsAny(tokens, "unisex", "uni")) {
            return Gender.UNISEX;
        }

        return null;
    }

    private String detectBrand(Set<String> tokens) {
        Map<String, String> brands = Map.ofEntries(
                Map.entry("nike", "Nike"),
                Map.entry("adidas", "Adidas"),
                Map.entry("puma", "Puma"),
                Map.entry("reebok", "Reebok"),
                Map.entry("asics", "Asics"),
                Map.entry("fila", "Fila"),
                Map.entry("vans", "Vans"),
                Map.entry("converse", "Converse"),
                Map.entry("anta", "Anta"),
                Map.entry("lining", "Li-Ning"),
                Map.entry("mizuno", "Mizuno")
        );

        for (Map.Entry<String, String> entry : brands.entrySet()) {
            if (tokens.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        if (tokens.contains("new") && tokens.contains("balance")) {
            return "New Balance";
        }

        if (tokens.contains("under") && tokens.contains("armour")) {
            return "Under Armour";
        }

        return null;
    }

    private Set<String> detectSportTerms(String normalized, Set<String> tokens) {
        Set<String> terms = new LinkedHashSet<>();

        if (normalized.contains("chay bo") || tokens.contains("running") || tokens.contains("run")) {
            terms.addAll(List.of("chạy bộ", "chay bo", "running", "run", "đi bộ nhiều", "di bo nhieu", "cardio", "runner"));
        }

        if (tokens.contains("gym") || normalized.contains("tap gym") || normalized.contains("the hinh") || tokens.contains("fitness") || tokens.contains("training")) {
            terms.addAll(List.of("gym", "fitness", "training", "tập gym", "tap gym", "thể hình", "the hinh"));
        }

        if (normalized.contains("bong da") || tokens.contains("football") || tokens.contains("soccer")) {
            terms.addAll(List.of("bóng đá", "bong da", "football", "soccer", "đá bóng", "da bong"));
        }

        if (tokens.contains("yoga")) {
            terms.addAll(List.of("yoga", "pilates"));
        }

        if (normalized.contains("cau long") || tokens.contains("badminton")) {
            terms.addAll(List.of("cầu lông", "cau long", "badminton"));
        }

        if (tokens.contains("tennis")) {
            terms.add("tennis");
        }

        return terms;
    }

    private Set<String> detectFeatureTerms(String normalized, Set<String> tokens) {
        Set<String> terms = new LinkedHashSet<>();

        if (AiTextNormalizer.containsAny(tokens, "em", "êm", "comfortable", "comfort") || normalized.contains("em chan")) {
            terms.addAll(List.of("êm", "êm chân", "em", "em chan", "comfort", "thoải mái"));
        }

        if (AiTextNormalizer.containsAny(tokens, "thoang", "mat", "nhe", "dry", "light", "breathable") || normalized.contains("thoang khi")) {
            terms.addAll(List.of("thoáng", "thoáng khí", "thoang khi", "mát", "nhẹ", "nhanh khô", "breathable", "light"));
        }

        if (normalized.contains("co gian") || AiTextNormalizer.containsAny(tokens, "elastic", "stretch")) {
            terms.addAll(List.of("co giãn", "co gian", "elastic", "stretch", "linh hoạt"));
        }

        if (AiTextNormalizer.containsAny(tokens, "om", "gon", "slim", "fit") || normalized.contains("gon nguoi")) {
            terms.addAll(List.of("ôm", "gọn", "slim", "fit", "ôm vừa"));
        }

        if (normalized.contains("mua he")) {
            terms.addAll(List.of("mùa hè", "mua he", "thoáng", "mát", "nhanh khô"));
        }

        if (normalized.contains("di bo nhieu") || normalized.contains("di ca ngay")) {
            terms.addAll(List.of("đi bộ nhiều", "di bo nhieu", "êm chân", "thoải mái"));
        }

        return terms;
    }

    private String detectSize(Set<String> tokens) {
        for (String token : tokens) {
            if (Set.of("xs", "s", "m", "l", "xl", "xxl", "xxxl").contains(token)) {
                return token.toUpperCase(Locale.ROOT);
            }

            if (token.matches("\\d{2}")) {
                return token;
            }
        }

        return null;
    }

    private String detectColor(Set<String> tokens) {
        Map<String, String> colors = Map.ofEntries(
                Map.entry("den", "đen"),
                Map.entry("trang", "trắng"),
                Map.entry("do", "đỏ"),
                Map.entry("xanh", "xanh"),
                Map.entry("vang", "vàng"),
                Map.entry("hong", "hồng"),
                Map.entry("tim", "tím"),
                Map.entry("xam", "xám"),
                Map.entry("nau", "nâu"),
                Map.entry("cam", "cam")
        );

        for (Map.Entry<String, String> entry : colors.entrySet()) {
            if (tokens.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return null;
    }

    private Double detectMaxPrice(String normalized) {
        List<Pattern> patterns = List.of(
                Pattern.compile("(?:duoi|toi da|max|khong qua|nho hon|<=)\\s*(\\d+(?:[\\.,]\\d+)?)\\s*(trieu|tr|m|k|nghin|ngan)?"),
                Pattern.compile("(\\d+(?:[\\.,]\\d+)?)\\s*(trieu|tr|m|k|nghin|ngan)\\s*(?:tro xuong|do lai)")
        );

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(normalized);
            if (matcher.find()) {
                return parseMoney(matcher.group(1), matcher.groupCount() >= 2 ? matcher.group(2) : null);
            }
        }

        return null;
    }

    private Double detectMinPrice(String normalized) {
        Pattern pattern = Pattern.compile("(?:tu|tren|lon hon|>=)\\s*(\\d+(?:[\\.,]\\d+)?)\\s*(trieu|tr|m|k|nghin|ngan)?");
        Matcher matcher = pattern.matcher(normalized);

        if (matcher.find()) {
            return parseMoney(matcher.group(1), matcher.group(2));
        }

        return null;
    }

    private Double parseMoney(String rawNumber, String rawUnit) {
        if (!AiTextNormalizer.hasText(rawNumber)) {
            return null;
        }

        double value;
        try {
            value = Double.parseDouble(rawNumber.replace(",", "."));
        } catch (NumberFormatException exception) {
            return null;
        }

        String unit = rawUnit == null ? "" : rawUnit.trim().toLowerCase(Locale.ROOT);

        if (Set.of("trieu", "tr", "m").contains(unit)) {
            return value * 1_000_000;
        }

        if (Set.of("k", "nghin", "ngan").contains(unit)) {
            return value * 1_000;
        }

        if (value > 0 && value <= 20) {
            return value * 1_000_000;
        }

        if (value > 20 && value < 1000) {
            return value * 1_000;
        }

        return value;
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }

    private String abbreviate(String value, int maxLength) {
        if (!AiTextNormalizer.hasText(value)) {
            return "";
        }

        String cleaned = value.replaceAll("\\s+", " ").trim();
        if (cleaned.length() <= maxLength) {
            return cleaned;
        }

        return cleaned.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    private record ScoredDocument(
            ProductAiDocument document,
            int score
    ) {
    }

    private record LlmRerankItem(
            Long productId,
            Integer score,
            String reason
    ) {
    }
}
