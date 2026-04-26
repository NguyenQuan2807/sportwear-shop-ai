package com.nguyenhuuquan.sportwearshop.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatMessage;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatRequest;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiChatResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.AiProductSuggestion;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductPageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductSearchRequest;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.service.AiChatService;
import com.nguyenhuuquan.sportwearshop.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatServiceImpl.class);

    private static final int SEARCH_SIZE_PER_QUERY = 12;
    private static final int FALLBACK_CATALOG_SIZE = 30;
    private static final int MAX_DETAIL_PRODUCTS = 8;
    private static final int MAX_SUGGESTIONS = 6;

    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    @Value("${app.ai.gemini.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    @Value("${app.ai.max-history:10}")
    private int maxHistory;

    public AiChatServiceImpl(ProductService productService, ObjectMapper objectMapper) {
        this.productService = productService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        List<AiChatMessage> history = safeHistory(request.getHistory());

        if (!aiEnabled || !StringUtils.hasText(geminiApiKey)) {
            return AiChatResponse.of(
                    "Mình chưa thể trò chuyện tự nhiên vì backend chưa đọc được GEMINI_API_KEY. "
                            + "Bạn hãy cấu hình GEMINI_API_KEY rồi chạy lại backend nhé.",
                    List.of()
            );
        }

        try {
            AiPlan plan = createPlan(userMessage, history);
            List<CandidateProduct> candidates = plan.needsProductData
                    ? collectProductContext(plan, userMessage, history)
                    : List.of();

            String reply = createNaturalAnswer(userMessage, history, plan, candidates);
            List<AiProductSuggestion> suggestions = buildSuggestions(reply, candidates, plan);

            return AiChatResponse.of(reply, suggestions);
        } catch (Exception ex) {
            log.error("AI chatbox processing failed", ex);

            String reason = ex.getMessage();
            if (!StringUtils.hasText(reason)) {
                reason = ex.getClass().getSimpleName();
            }

            return AiChatResponse.of(
                    "Mình đang gặp lỗi khi xử lý câu hỏi này. Lý do kỹ thuật: " + reason
                            + "\n\nBạn xem log backend để biết chi tiết. Nếu là lỗi 429 thì thường là quá quota/rate limit; "
                            + "nếu là 400 thì thường là request gửi sang Gemini chưa hợp lệ hoặc context quá dài.",
                    List.of()
            );
        }
    }

    private AiPlan createPlan(String userMessage, List<AiChatMessage> history) throws Exception {
        try {
            String prompt = """
                Bạn là bộ não điều phối cho AI chatbox của Sportwear Shop.
                Nhiệm vụ của bạn là hiểu câu hỏi mới nhất của khách trong ngữ cảnh hội thoại.

                Trả về JSON THUẦN, không markdown, không giải thích.
                Không cần trả lời khách ở bước này.

                Các intent:
                - GENERAL_CHAT: chào hỏi, cảm ơn, nói chuyện chung.
                - SHOP_HELP: hỏi cách mua hàng, thanh toán, giao hàng, đổi trả.
                - PRODUCT_SEARCH: muốn tìm/gợi ý/mua sản phẩm.
                - PRODUCT_DETAIL: hỏi về sản phẩm cụ thể, hỏi tiếp bằng "đó", hỏi size/màu/giá/chất liệu/tồn kho/mô tả.

                Quy tắc quan trọng:
                - Nếu khách nói "áo đó", "sản phẩm đó", "cái đó", hãy dùng lịch sử để hiểu đang nói tới sản phẩm trước.
                - Nếu khách nhập sai chính tả nhẹ, hãy sửa trong correctedMessage và queryCandidates.
                - queryCandidates phải là các cụm tìm kiếm ngắn, tự nhiên, có cả cụm cụ thể và cụm rộng hơn.
                  Ví dụ "tôi cần tìm 1 chiếc áo màu đỏ" -> ["áo màu đỏ", "áo", "quần áo"]
                  Ví dụ "áo bóng đá englend 2026 stadium away" -> ["áo bóng đá england 2026 stadium away", "england stadium away", "áo bóng đá england", "áo"]
                - Nếu cần dữ liệu sản phẩm, needsProductData=true.
                - Nếu chỉ chào hỏi/cảm ơn, needsProductData=false.

                JSON schema:
                {
                  "intent": "GENERAL_CHAT|SHOP_HELP|PRODUCT_SEARCH|PRODUCT_DETAIL",
                  "correctedMessage": "câu khách đã được hiểu/sửa lỗi chính tả",
                  "needsProductData": true,
                  "queryCandidates": ["cụm tìm kiếm 1", "cụm tìm kiếm 2"],
                  "referencedProductIds": [110],
                  "answerGoal": "khách đang muốn biết điều gì ở câu mới nhất",
                  "shouldAskClarifyingQuestion": false
                }

                Lịch sử hội thoại:
                %s

                Câu hỏi mới nhất:
                %s
                """.formatted(historyText(history), userMessage);

            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.15,
                            "topP", 0.85,
                            "maxOutputTokens", 700
                    )
            );

            JsonNode response = postGemini(payload);
            String text = response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            JsonNode json = objectMapper.readTree(extractJson(text));

            AiPlan plan = new AiPlan();
            plan.intent = json.path("intent").asText("PRODUCT_SEARCH");
            plan.correctedMessage = json.path("correctedMessage").asText(userMessage);
            plan.needsProductData = json.path("needsProductData").asBoolean(needsProductDataByIntent(plan.intent));
            plan.answerGoal = json.path("answerGoal").asText("");
            plan.shouldAskClarifyingQuestion = json.path("shouldAskClarifyingQuestion").asBoolean(false);

            JsonNode queryArray = json.path("queryCandidates");
            if (queryArray.isArray()) {
                for (JsonNode item : queryArray) {
                    String value = item.asText("").trim();
                    if (StringUtils.hasText(value)) {
                        plan.queryCandidates.add(value);
                    }
                }
            }

            JsonNode idArray = json.path("referencedProductIds");
            if (idArray.isArray()) {
                for (JsonNode item : idArray) {
                    if (item.canConvertToLong()) {
                        plan.referencedProductIds.add(item.asLong());
                    }
                }
            }

            plan.referencedProductIds.addAll(extractProductIds(historyText(history) + "\n" + userMessage));

            if (plan.needsProductData && plan.queryCandidates.isEmpty() && StringUtils.hasText(userMessage)) {
                plan.queryCandidates.add(userMessage);
            }

            plan.queryCandidates = dedupeStrings(plan.queryCandidates).stream()
                    .limit(6)
                    .collect(Collectors.toCollection(ArrayList::new));
            plan.referencedProductIds = plan.referencedProductIds.stream()
                    .filter(Objects::nonNull)
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toCollection(ArrayList::new));

            return plan;
        } catch (Exception ex) {
            log.warn("Gemini plan step failed, using fallback plan. Message: {}", ex.getMessage());
            return fallbackPlan(userMessage, history);
        }
    }

    private AiPlan fallbackPlan(String userMessage, List<AiChatMessage> history) {
        AiPlan plan = new AiPlan();
        plan.intent = "PRODUCT_SEARCH";
        plan.correctedMessage = userMessage;
        plan.needsProductData = true;
        plan.answerGoal = "Trả lời câu hỏi mới nhất của khách dựa trên sản phẩm phù hợp.";

        Set<Long> ids = extractProductIds(historyText(history) + "\n" + userMessage);
        plan.referencedProductIds.addAll(ids);

        if (StringUtils.hasText(userMessage)) {
            plan.queryCandidates.add(userMessage);

            String normalized = normalize(userMessage);
            if (normalized.contains("ao")) {
                plan.queryCandidates.add("áo");
            }
            if (normalized.contains("giay")) {
                plan.queryCandidates.add("giày");
            }
            if (normalized.contains("quan")) {
                plan.queryCandidates.add("quần");
            }
        }

        plan.queryCandidates = dedupeStrings(plan.queryCandidates).stream()
                .limit(5)
                .collect(Collectors.toCollection(ArrayList::new));

        return plan;
    }

    private List<CandidateProduct> collectProductContext(AiPlan plan, String userMessage, List<AiChatMessage> history) {
        LinkedHashMap<Long, ProductResponse> productMap = new LinkedHashMap<>();

        for (Long id : plan.referencedProductIds) {
            ProductDetailResponse detail = safeGetProductDetail(id);
            if (detail != null) {
                productMap.putIfAbsent(id, toProductResponse(detail));
            }
        }

        for (String query : plan.queryCandidates) {
            searchProducts(query, productMap);
        }

        if (productMap.isEmpty()) {
            for (String query : createBroadQueries(userMessage)) {
                searchProducts(query, productMap);
            }
        }

        if (productMap.isEmpty()) {
            ProductSearchRequest fallbackRequest = new ProductSearchRequest();
            fallbackRequest.setPage(0);
            fallbackRequest.setSize(FALLBACK_CATALOG_SIZE);
            fallbackRequest.setSort("newest");
            safeProducts(productService.getAllProducts(fallbackRequest)).forEach(product -> {
                if (product.getId() != null) {
                    productMap.putIfAbsent(product.getId(), product);
                }
            });
        }

        List<CandidateProduct> result = new ArrayList<>();
        int detailCount = 0;

        for (ProductResponse product : productMap.values()) {
            ProductDetailResponse detail = null;

            if (product.getId() != null && detailCount < MAX_DETAIL_PRODUCTS) {
                detail = safeGetProductDetail(product.getId());
                detailCount++;
            }

            result.add(new CandidateProduct(product, detail));
        }

        return result.stream()
                .limit(MAX_DETAIL_PRODUCTS)
                .collect(Collectors.toList());
    }

    private void searchProducts(String keyword, LinkedHashMap<Long, ProductResponse> productMap) {
        if (!StringUtils.hasText(keyword)) {
            return;
        }

        ProductSearchRequest request = new ProductSearchRequest();
        request.setKeyword(keyword.trim());
        request.setPage(0);
        request.setSize(SEARCH_SIZE_PER_QUERY);
        request.setSort("newest");

        safeProducts(productService.getAllProducts(request)).forEach(product -> {
            if (product.getId() != null) {
                productMap.putIfAbsent(product.getId(), product);
            }
        });
    }

    private String createNaturalAnswer(String userMessage,
                                       List<AiChatMessage> history,
                                       AiPlan plan,
                                       List<CandidateProduct> candidates) throws Exception {
        String prompt = """
                Bạn là trợ lý AI bán hàng của Sportwear Shop.
                Hãy trả lời như một nhân viên tư vấn thật: tự nhiên, có ngữ cảnh, không máy móc, không lặp lại câu trả lời cũ.

                Nguyên tắc bắt buộc:
                1. Chỉ dùng dữ liệu sản phẩm được cung cấp. Không bịa tên, giá, size, màu, tồn kho.
                2. Trả lời ĐÚNG câu hỏi mới nhất, không trả lại toàn bộ mô tả nếu khách chỉ hỏi size/màu/giá/tồn kho.
                3. Nếu khách hỏi tiếp bằng "đó/cái đó/sản phẩm đó", hãy dựa vào lịch sử và sản phẩm có ID trong lịch sử.
                4. Nếu khách muốn tìm sản phẩm theo điều kiện, hãy gợi ý sản phẩm phù hợp nhất; nếu không thấy đúng điều kiện, nói thật và hỏi thêm 1 câu ngắn.
                5. Nếu dữ liệu không đủ, hãy hỏi lại tự nhiên, không tự thêm luật cứng.
                6. Không nhắc tới database, backend, JSON, Gemini hay prompt.
                7. Viết tiếng Việt thân thiện, vừa đủ. Đừng quá dài.

                Lịch sử hội thoại:
                %s

                Câu hỏi mới nhất:
                %s

                Cách hệ thống hiểu câu hỏi:
                - intent: %s
                - correctedMessage: %s
                - answerGoal: %s
                - queryCandidates: %s

                Dữ liệu sản phẩm khả dụng:
                %s

                Cách trả lời:
                - Nếu intent GENERAL_CHAT: trả lời ngắn và gợi mở hỗ trợ.
                - Nếu intent SHOP_HELP: trả lời theo vai trò shop; nếu không có chính sách cụ thể thì nói ở mức chung, không bịa cam kết.
                - Nếu intent PRODUCT_DETAIL: trả lời đúng chi tiết khách hỏi. Ví dụ hỏi "có size nào" thì chỉ liệt kê size/tồn kho ngắn gọn.
                - Nếu intent PRODUCT_SEARCH: gợi ý 2-4 sản phẩm hợp nhất trong dữ liệu, kèm lý do ngắn.
                - Khi nhắc sản phẩm cụ thể, nếu có ID hãy thêm dòng "Xem chi tiết: /products/{id}".
                """.formatted(
                historyText(history),
                userMessage,
                plan.intent,
                plan.correctedMessage,
                plan.answerGoal,
                plan.queryCandidates,
                productContextText(candidates)
        );

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.85,
                        "topP", 0.95,
                        "maxOutputTokens", 1000
                )
        );

        JsonNode response = postGemini(payload);
        return response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("").trim();
    }

    private List<AiProductSuggestion> buildSuggestions(String reply, List<CandidateProduct> candidates, AiPlan plan) {
        if (!plan.needsProductData || candidates.isEmpty()) {
            return List.of();
        }

        Set<Long> idsInReply = extractProductIds(reply);
        List<CandidateProduct> selected = new ArrayList<>();

        if (!idsInReply.isEmpty()) {
            for (CandidateProduct candidate : candidates) {
                Long id = candidate.id();
                if (id != null && idsInReply.contains(id)) {
                    selected.add(candidate);
                }
            }
        }

        if (selected.isEmpty()) {
            selected.addAll(candidates.stream().limit(MAX_SUGGESTIONS).toList());
        }

        return selected.stream()
                .limit(MAX_SUGGESTIONS)
                .map(this::toSuggestion)
                .collect(Collectors.toList());
    }

    private AiProductSuggestion toSuggestion(CandidateProduct candidate) {
        ProductResponse product = candidate.summary();
        ProductDetailResponse detail = candidate.detail();

        AiProductSuggestion suggestion = new AiProductSuggestion();
        suggestion.setId(candidate.id());
        suggestion.setName(detail != null ? detail.getName() : product.getName());
        suggestion.setBrandName(detail != null ? detail.getBrandName() : product.getBrandName());
        suggestion.setCategoryName(detail != null ? detail.getCategoryName() : product.getCategoryName());
        suggestion.setSportName(detail != null ? detail.getSportName() : product.getSportName());
        suggestion.setGender(detail != null ? detail.getGender() : product.getGender());
        suggestion.setThumbnailUrl(detail != null ? detail.getThumbnailUrl() : product.getThumbnailUrl());
        suggestion.setProductUrl(candidate.id() == null ? null : "/products/" + candidate.id());
        suggestion.setPriceLabel(detail != null ? detailPriceLabel(detail) : productPriceLabel(product));
        suggestion.setReason("Phù hợp với nội dung bạn đang trao đổi");
        return suggestion;
    }

    private String productContextText(List<CandidateProduct> candidates) {
        if (candidates.isEmpty()) {
            return "Không có sản phẩm phù hợp được tìm thấy.";
        }

        return candidates.stream()
                .map(candidate -> {
                    if (candidate.detail() != null) {
                        return detailContext(candidate.detail());
                    }

                    return summaryContext(candidate.summary());
                })
                .collect(Collectors.joining("\n---\n"));
    }

    private String summaryContext(ProductResponse product) {
        return """
                ID: %s
                Tên: %s
                Slug: %s
                Danh mục: %s
                Thương hiệu: %s
                Môn thể thao: %s
                Giới tính: %s
                Chất liệu: %s
                Giá: %s
                Mô tả ngắn: %s
                Link: /products/%s
                """.formatted(
                product.getId(),
                safe(product.getName()),
                safe(product.getSlug()),
                safe(product.getCategoryName()),
                safe(product.getBrandName()),
                safe(product.getSportName()),
                safe(product.getGender()),
                safe(product.getMaterial()),
                productPriceLabel(product),
                safe(product.getDescription()),
                product.getId()
        );
    }

    private String detailContext(ProductDetailResponse detail) {
        String variants = "Không có dữ liệu biến thể.";

        if (detail.getVariants() != null && !detail.getVariants().isEmpty()) {
            variants = detail.getVariants().stream()
                    .limit(12)
                    .map(this::variantContext)
                    .collect(Collectors.joining("\n"));
        }

        return """
                ID: %s
                Tên: %s
                Slug: %s
                Danh mục: %s
                Thương hiệu: %s
                Môn thể thao: %s
                Giới tính: %s
                Chất liệu: %s
                Giá: %s
                Mô tả: %s
                Biến thể:
                %s
                Link: /products/%s
                """.formatted(
                detail.getId(),
                safe(detail.getName()),
                safe(detail.getSlug()),
                safe(detail.getCategoryName()),
                safe(detail.getBrandName()),
                safe(detail.getSportName()),
                safe(detail.getGender()),
                safe(detail.getMaterial()),
                detailPriceLabel(detail),
                safe(detail.getDescription()),
                variants,
                detail.getId()
        );
    }

    private String variantContext(ProductVariantResponse variant) {
        List<String> parts = new ArrayList<>();

        if (StringUtils.hasText(variant.getSize())) {
            parts.add("size " + variant.getSize());
        }

        if (StringUtils.hasText(variant.getColor())) {
            parts.add("màu " + variant.getColor());
        }

        Double price = variant.getFinalPrice() != null ? variant.getFinalPrice() : variant.getPrice();
        if (price != null) {
            parts.add("giá " + formatCurrency(price));
        }

        if (variant.getStockQuantity() != null) {
            parts.add("còn " + variant.getStockQuantity());
        }

        if (Boolean.TRUE.equals(variant.getOnPromotion()) && variant.getDiscountPercent() != null) {
            parts.add("giảm " + variant.getDiscountPercent() + "%");
        }

        return "- " + String.join(", ", parts);
    }

    private JsonNode postGemini(Map<String, Object> payload) throws Exception {
        String endpoint = geminiBaseUrl.replaceAll("/$", "")
                + "/" + geminiModel
                + ":generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(40))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Gemini API error " + response.statusCode() + ": " + response.body());
        }

        return objectMapper.readTree(response.body());
    }

    private ProductDetailResponse safeGetProductDetail(Long id) {
        if (id == null) {
            return null;
        }

        try {
            return productService.getProductById(id);
        } catch (Exception ignored) {
            return null;
        }
    }

    private List<ProductResponse> safeProducts(ProductPageResponse page) {
        if (page == null || page.getContent() == null) {
            return List.of();
        }

        return page.getContent();
    }

    private ProductResponse toProductResponse(ProductDetailResponse detail) {
        ProductResponse product = new ProductResponse();
        product.setId(detail.getId());
        product.setName(detail.getName());
        product.setSlug(detail.getSlug());
        product.setDescription(detail.getDescription());
        product.setCategoryName(detail.getCategoryName());
        product.setBrandName(detail.getBrandName());
        product.setSportName(detail.getSportName());
        product.setGender(detail.getGender());
        product.setMaterial(detail.getMaterial());
        product.setThumbnailUrl(detail.getThumbnailUrl());
        product.setIsActive(detail.getIsActive());
        return product;
    }

    private String productPriceLabel(ProductResponse product) {
        Double min = product.getSaleMinPrice() != null ? product.getSaleMinPrice() : product.getMinPrice();
        Double max = product.getSaleMaxPrice() != null ? product.getSaleMaxPrice() : product.getMaxPrice();

        if (min == null && max == null) {
            return "Liên hệ";
        }

        if (max == null || Objects.equals(min, max)) {
            return formatCurrency(min);
        }

        return formatCurrency(min) + " - " + formatCurrency(max);
    }

    private String detailPriceLabel(ProductDetailResponse detail) {
        if (detail.getVariants() == null || detail.getVariants().isEmpty()) {
            return "Liên hệ";
        }

        List<Double> prices = detail.getVariants().stream()
                .map(variant -> variant.getFinalPrice() != null ? variant.getFinalPrice() : variant.getPrice())
                .filter(Objects::nonNull)
                .sorted()
                .toList();

        if (prices.isEmpty()) {
            return "Liên hệ";
        }

        Double min = prices.get(0);
        Double max = prices.get(prices.size() - 1);

        if (Objects.equals(min, max)) {
            return formatCurrency(min);
        }

        return formatCurrency(min) + " - " + formatCurrency(max);
    }

    private String formatCurrency(Double value) {
        if (value == null) {
            return "0 đ";
        }

        return NumberFormat.getInstance(new Locale("vi", "VN")).format(value.longValue()) + " đ";
    }

    private List<AiChatMessage> safeHistory(List<AiChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }

        int limit = Math.max(0, Math.min(maxHistory, 12));

        return history.stream()
                .filter(item -> item != null && StringUtils.hasText(item.getContent()))
                .skip(Math.max(0, history.size() - limit))
                .collect(Collectors.toList());
    }

    private String historyText(List<AiChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return "Không có.";
        }

        return history.stream()
                .map(item -> safe(item.getRole()) + ": " + safe(item.getContent()))
                .collect(Collectors.joining("\n"));
    }

    private boolean needsProductDataByIntent(String intent) {
        return "PRODUCT_SEARCH".equals(intent) || "PRODUCT_DETAIL".equals(intent);
    }

    private List<String> createBroadQueries(String message) {
        String normalized = normalize(message);
        LinkedHashSet<String> queries = new LinkedHashSet<>();

        if (normalized.contains("ao")) {
            queries.add("áo");
        }

        if (normalized.contains("giay")) {
            queries.add("giày");
        }

        if (normalized.contains("quan")) {
            queries.add("quần");
        }

        if (normalized.contains("balo") || normalized.contains("phu kien")) {
            queries.add("phụ kiện");
        }

        if (queries.isEmpty() && StringUtils.hasText(message)) {
            queries.add(message);
        }

        return new ArrayList<>(queries);
    }

    private Set<Long> extractProductIds(String text) {
        if (!StringUtils.hasText(text)) {
            return Set.of();
        }

        Set<Long> ids = new LinkedHashSet<>();
        Pattern pattern = Pattern.compile("(?:/products/|PRODUCT_ID:\\s*|ID\\s*)(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            try {
                ids.add(Long.parseLong(matcher.group(1)));
            } catch (NumberFormatException ignored) {
            }
        }

        return ids;
    }

    private String extractJson(String rawText) {
        String text = rawText == null ? "" : rawText.trim();

        if (text.startsWith("```")) {
            text = text.replaceFirst("^```json", "")
                    .replaceFirst("^```", "")
                    .replaceFirst("```$", "")
                    .trim();
        }

        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');

        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }

        return text;
    }

    private List<String> dedupeStrings(List<String> values) {
        return values.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.collectingAndThen(
                        Collectors.toCollection(LinkedHashSet::new),
                        ArrayList::new
                ));
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private static class AiPlan {
        private String intent = "GENERAL_CHAT";
        private String correctedMessage = "";
        private boolean needsProductData = false;
        private List<String> queryCandidates = new ArrayList<>();
        private List<Long> referencedProductIds = new ArrayList<>();
        private String answerGoal = "";
        private boolean shouldAskClarifyingQuestion = false;
    }

    private record CandidateProduct(ProductResponse summary, ProductDetailResponse detail) {
        private Long id() {
            if (detail != null) {
                return detail.getId();
            }

            return summary == null ? null : summary.getId();
        }
    }
}
