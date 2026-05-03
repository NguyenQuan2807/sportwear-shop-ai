package com.nguyenhuuquan.sportwearshop.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionTargetType;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiDashboardInsightResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiPriorityActionResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiPromotionSuggestionResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.ai.AdminAiPromotionSuggestionsResponse;
import com.nguyenhuuquan.sportwearshop.entity.Order;
import com.nguyenhuuquan.sportwearshop.entity.OrderItem;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.Promotion;
import com.nguyenhuuquan.sportwearshop.entity.PromotionTarget;
import com.nguyenhuuquan.sportwearshop.repository.OrderItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.OrderRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.repository.PromotionRepository;
import com.nguyenhuuquan.sportwearshop.repository.PromotionTargetRepository;
import com.nguyenhuuquan.sportwearshop.service.AdminAiService;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAiServiceImpl implements AdminAiService {

    private static final Logger log = LoggerFactory.getLogger(AdminAiServiceImpl.class);

    private static final String SOURCE_RULE_BASED = "RULE_BASED";
    private static final String SOURCE_GEMINI_GROUNDED = "GEMINI_GROUNDED";
    private static final double MIN_PROFIT_MARGIN_RATE = 0.10;
    private static final int MIN_SAFE_DISCOUNT_PERCENT = 5;
    private static final int NEW_PRODUCT_PROTECTED_DAYS = 14;
    private static final int NORMAL_PROMOTION_MIN_AGE_DAYS = 30;
    private static final int NEW_PRODUCT_EXCEPTION_STOCK_THRESHOLD = 100;
    private static final int NEW_PRODUCT_MAX_DISCOUNT_PERCENT = 10;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionTargetRepository promotionTargetRepository;
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

    public AdminAiServiceImpl(OrderRepository orderRepository,
                              OrderItemRepository orderItemRepository,
                              ProductRepository productRepository,
                              ProductVariantRepository productVariantRepository,
                              PromotionRepository promotionRepository,
                              PromotionTargetRepository promotionTargetRepository,
                              ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.promotionRepository = promotionRepository;
        this.promotionTargetRepository = promotionTargetRepository;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAiDashboardInsightResponse getDashboardInsight(String period, String date, String month, Integer year) {
        String safePeriod = normalizePeriod(period);
        PeriodRange currentRange = buildCurrentRange(safePeriod, date, month, year);
        PeriodRange previousRange = buildPreviousRange(currentRange, safePeriod);

        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<OrderItem> allOrderItems = orderItemRepository.findAll();
        List<ProductVariant> variants = productVariantRepository.findAll();

        List<Order> currentOrders = filterOrdersByRange(allOrders, currentRange.start(), currentRange.end());
        List<Order> previousOrders = filterOrdersByRange(allOrders, previousRange.start(), previousRange.end());

        DashboardSnapshot snapshot = buildDashboardSnapshot(
                safePeriod,
                currentRange,
                currentOrders,
                previousOrders,
                allOrderItems,
                variants
        );

        AdminAiDashboardInsightResponse fallback = buildLocalDashboardInsight(snapshot);

        if (!canUseGemini()) {
            return fallback;
        }

        try {
            String prompt = buildDashboardPrompt(snapshot);
            String text = askGemini(prompt, 900, 0.35);
            AdminAiDashboardInsightResponse geminiResponse = parseDashboardInsight(text);

            if (geminiResponse != null) {
                return new AdminAiDashboardInsightResponse(
                        geminiResponse.overview(),
                        geminiResponse.highlights(),
                        geminiResponse.warnings(),
                        geminiResponse.recommendations(),
                        geminiResponse.priorityActions(),
                        SOURCE_GEMINI_GROUNDED
                );
            }
        } catch (Exception exception) {
            log.warn("Gemini dashboard insight failed. Fallback to rule-based insight.", exception);
        }

        return fallback;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAiPromotionSuggestionsResponse getPromotionSuggestions() {
        List<Product> products = productRepository.findAll();
        List<ProductVariant> variants = productVariantRepository.findAll();
        List<OrderItem> orderItems = orderItemRepository.findAll();
        List<Promotion> promotions = promotionRepository.findAll();
        List<PromotionTarget> promotionTargets = promotionTargetRepository.findAll();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);

        Map<Long, List<ProductVariant>> variantsByProductId = variants.stream()
                .filter(variant -> variant.getProduct() != null && variant.getProduct().getId() != null)
                .collect(Collectors.groupingBy(variant -> variant.getProduct().getId()));

        Map<Long, ProductSales> salesByProductId = buildProductSales(orderItems, last30Days, now);
        ActivePromotionIndex activePromotionIndex = buildActivePromotionIndex(promotions, promotionTargets, now);

        List<AdminAiPromotionSuggestionResponse> localSuggestions = products.stream()
                .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                .map(product -> buildPromotionSuggestion(product, variantsByProductId, salesByProductId, activePromotionIndex))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(AdminAiPromotionSuggestionResponse::score).reversed())
                .limit(10)
                .toList();

        String localSummary = buildLocalPromotionSummary(localSuggestions);

        AdminAiPromotionSuggestionsResponse fallback = new AdminAiPromotionSuggestionsResponse(
                localSummary,
                localSuggestions,
                SOURCE_RULE_BASED
        );

        if (!canUseGemini() || localSuggestions.isEmpty()) {
            return fallback;
        }

        try {
            String prompt = buildPromotionPrompt(localSuggestions);
            String text = askGemini(prompt, 1000, 0.35);
            AdminAiPromotionSuggestionsResponse geminiResponse = parsePromotionSuggestions(text, localSuggestions);

            if (geminiResponse != null) {
                return new AdminAiPromotionSuggestionsResponse(
                        geminiResponse.summary(),
                        geminiResponse.suggestions(),
                        SOURCE_GEMINI_GROUNDED
                );
            }
        } catch (Exception exception) {
            log.warn("Gemini promotion suggestions failed. Fallback to rule-based suggestions.", exception);
        }

        return fallback;
    }

    private DashboardSnapshot buildDashboardSnapshot(String period,
                                                     PeriodRange currentRange,
                                                     List<Order> currentOrders,
                                                     List<Order> previousOrders,
                                                     List<OrderItem> allOrderItems,
                                                     List<ProductVariant> variants) {
        double totalRevenue = sumOrderRevenue(currentOrders);
        double previousRevenue = sumOrderRevenue(previousOrders);

        long totalOrders = currentOrders.size();
        long previousTotalOrders = previousOrders.size();

        long pendingOrders = countByStatus(currentOrders, "PENDING");
        long cancelledOrders = countByStatus(currentOrders, "CANCELLED");
        long deliveredOrders = countByStatus(currentOrders, "DELIVERED") + countByStatus(currentOrders, "COMPLETED");

        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;
        double revenueGrowthPercent = growthPercent(totalRevenue, previousRevenue);
        double orderGrowthPercent = growthPercent(totalOrders, previousTotalOrders);
        double pendingRate = totalOrders > 0 ? pendingOrders * 100.0 / totalOrders : 0.0;
        double cancelRate = totalOrders > 0 ? cancelledOrders * 100.0 / totalOrders : 0.0;

        Map<String, Long> orderStatusStats = currentOrders.stream()
                .filter(order -> order.getStatus() != null)
                .collect(Collectors.groupingBy(order -> order.getStatus().name(), LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> paymentStats = currentOrders.stream()
                .filter(order -> order.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(order -> order.getPaymentMethod().name(), LinkedHashMap::new, Collectors.counting()));

        String topPaymentMethod = paymentStats.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Chưa có dữ liệu");

        List<ProductPerformance> topProducts = buildTopProducts(allOrderItems, currentOrders)
                .stream()
                .limit(5)
                .toList();

        List<LowStockItem> lowStockProducts = variants.stream()
                .filter(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() <= 5)
                .sorted(Comparator.comparing(variant -> variant.getStockQuantity() == null ? 0 : variant.getStockQuantity()))
                .limit(8)
                .map(this::toLowStockItem)
                .toList();

        List<ProductPerformance> slowMovingProducts = buildSlowMovingProducts(allOrderItems, variants);

        return new DashboardSnapshot(
                period,
                currentRange.label(),
                totalRevenue,
                previousRevenue,
                revenueGrowthPercent,
                totalOrders,
                previousTotalOrders,
                orderGrowthPercent,
                pendingOrders,
                cancelledOrders,
                deliveredOrders,
                pendingRate,
                cancelRate,
                averageOrderValue,
                topPaymentMethod,
                orderStatusStats,
                paymentStats,
                topProducts,
                lowStockProducts,
                slowMovingProducts
        );
    }

    private AdminAiDashboardInsightResponse buildLocalDashboardInsight(DashboardSnapshot snapshot) {
        List<String> highlights = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<AdminAiPriorityActionResponse> actions = new ArrayList<>();

        if (snapshot.revenueGrowthPercent() >= 10) {
            highlights.add("Doanh thu đang tăng " + formatPercent(snapshot.revenueGrowthPercent()) + " so với kỳ trước.");
        } else if (snapshot.revenueGrowthPercent() < -10) {
            warnings.add("Doanh thu đang giảm " + formatPercent(Math.abs(snapshot.revenueGrowthPercent())) + " so với kỳ trước.");
        } else {
            highlights.add("Doanh thu tương đối ổn định so với kỳ trước.");
        }

        if (!snapshot.topProducts().isEmpty()) {
            ProductPerformance top = snapshot.topProducts().get(0);
            highlights.add("Sản phẩm bán tốt nhất là " + top.productName() + " với " + top.quantitySold() + " sản phẩm đã bán.");
        }

        if (snapshot.pendingOrders() > 0) {
            warnings.add("Có " + snapshot.pendingOrders() + " đơn hàng đang chờ xác nhận.");
            actions.add(new AdminAiPriorityActionResponse(
                    "Xác nhận đơn hàng mới",
                    "Ưu tiên xử lý các đơn PENDING để giảm nguy cơ khách hủy đơn.",
                    snapshot.pendingOrders() >= 5 ? "HIGH" : "MEDIUM"
            ));
        }

        if (snapshot.cancelRate() >= 10) {
            warnings.add("Tỷ lệ hủy đơn đang ở mức " + formatPercent(snapshot.cancelRate()) + ", cần kiểm tra nguyên nhân.");
            actions.add(new AdminAiPriorityActionResponse(
                    "Kiểm tra nguyên nhân hủy đơn",
                    "Xem lại địa chỉ giao hàng, phương thức thanh toán và thời gian xác nhận đơn.",
                    "HIGH"
            ));
        }

        if (!snapshot.lowStockProducts().isEmpty()) {
            LowStockItem item = snapshot.lowStockProducts().get(0);
            warnings.add("Một số biến thể sắp hết hàng, ví dụ " + item.productName() + " size " + item.size() + " còn " + item.stockQuantity() + ".");
            recommendations.add("Nên nhập thêm các biến thể tồn kho thấp nhưng vẫn đang có nhu cầu.");
        }

        if (!snapshot.slowMovingProducts().isEmpty()) {
            ProductPerformance slow = snapshot.slowMovingProducts().get(0);
            recommendations.add("Nên cân nhắc khuyến mãi cho nhóm tồn kho cao bán chậm, ví dụ " + slow.productName() + ".");
            actions.add(new AdminAiPriorityActionResponse(
                    "Tạo khuyến mãi cho hàng bán chậm",
                    "Dùng AI gợi ý khuyến mãi để chọn sản phẩm có tồn kho cao và số bán thấp trong 30 ngày.",
                    "MEDIUM"
            ));
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Tiếp tục theo dõi doanh thu, trạng thái đơn hàng và tồn kho mỗi ngày để phát hiện vấn đề sớm.");
        }

        String overview = "Trong " + snapshot.periodLabel() + ", shop có " + snapshot.totalOrders()
                + " đơn hàng, doanh thu " + formatMoney(snapshot.totalRevenue())
                + ", giá trị đơn trung bình " + formatMoney(snapshot.averageOrderValue()) + ".";

        return new AdminAiDashboardInsightResponse(
                overview,
                highlights,
                warnings,
                recommendations,
                actions,
                SOURCE_RULE_BASED
        );
    }

    private AdminAiPromotionSuggestionResponse buildPromotionSuggestion(Product product,
                                                                        Map<Long, List<ProductVariant>> variantsByProductId,
                                                                        Map<Long, ProductSales> salesByProductId,
                                                                        ActivePromotionIndex activePromotionIndex) {
        List<ProductVariant> variants = variantsByProductId.getOrDefault(product.getId(), List.of());
        int totalStock = variants.stream()
                .map(ProductVariant::getStockQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        if (totalStock <= 0) {
            return null;
        }

        ProductSales sales = salesByProductId.getOrDefault(product.getId(), new ProductSales(0, 0.0));
        boolean hasActivePromotion = activePromotionIndex.matchesProduct(product, variants);
        int productAgeDays = calculateProductAgeDays(product);
        ProductAgeRuleResult ageRule = evaluateProductAgeRule(productAgeDays, totalStock, sales.quantitySold());

        if (!ageRule.eligible()) {
            return null;
        }

        double stockScore = Math.min(totalStock / 80.0, 1.0);
        double slowScore = calculateSlowScore(sales.quantitySold());
        double revenueLowScore = calculateRevenueLowScore(sales.revenue());
        double noPromotionScore = hasActivePromotion ? 0.0 : 1.0;
        double activeScore = Boolean.TRUE.equals(product.getIsActive()) ? 1.0 : 0.0;
        double productMaturityScore = calculateProductMaturityScore(productAgeDays);

        double score = stockScore * 0.30
                + slowScore * 0.25
                + revenueLowScore * 0.15
                + noPromotionScore * 0.10
                + activeScore * 0.10
                + productMaturityScore * 0.10;

        if (score < 0.45) {
            return null;
        }

        int originalDiscount = suggestDiscountPercent(score, totalStock, sales.quantitySold(), hasActivePromotion);
        if (ageRule.maxDiscountPercent() != null) {
            originalDiscount = Math.min(originalDiscount, ageRule.maxDiscountPercent());
        }
        ProfitProtectionResult protection = calculateProfitProtection(variants, originalDiscount);
        int discount = protection.safeDiscountPercent();
        String priority = score >= 0.75 ? "HIGH" : score >= 0.58 ? "MEDIUM" : "LOW";
        String productName = safe(product.getName());

        String reason;
        if (hasActivePromotion) {
            reason = "Sản phẩm đang có khuyến mãi, nhưng vẫn cần theo dõi vì tồn kho còn " + totalStock
                    + " và 30 ngày gần đây bán " + sales.quantitySold() + " sản phẩm.";
        } else if (sales.quantitySold() <= 5 && totalStock >= 30) {
            reason = "Tồn kho cao nhưng tốc độ bán trong 30 ngày gần đây thấp.";
        } else if (totalStock >= 50) {
            reason = "Tồn kho đang cao, có thể dùng khuyến mãi để tăng tốc độ bán.";
        } else {
            reason = "Sản phẩm có dấu hiệu cần kích cầu nhẹ để cải thiện doanh số.";
        }

        if (ageRule.warning() != null && !ageRule.warning().isBlank()) {
            reason = reason + " " + ageRule.warning();
        }

        if (protection.profitWarning() != null && !protection.profitWarning().isBlank()) {
            reason = reason + " " + protection.profitWarning();
        }

        String expectedImpact;
        if (discount <= 0) {
            expectedImpact = "Không nên giảm giá trực tiếp lúc này. Hãy cập nhật đủ giá nhập hoặc dùng quà tặng, freeship, combo để kích cầu mà không bán dưới vốn.";
        } else if (ageRule.ageRuleApplied()) {
            expectedImpact = "Sản phẩm còn khá mới nên AI chỉ cho phép giảm nhẹ tối đa " + NEW_PRODUCT_MAX_DISCOUNT_PERCENT + "% để kiểm tra nhu cầu thị trường, không xả hàng quá sớm.";
        } else if (protection.discountAdjusted()) {
            expectedImpact = "Mức giảm đã được AI hạ từ " + originalDiscount + "% xuống " + discount
                    + "% để giữ lợi nhuận tối thiểu " + Math.round(MIN_PROFIT_MARGIN_RATE * 100) + "%.";
        } else if (discount >= 20) {
            expectedImpact = "Kỳ vọng xả tồn nhanh và tăng lượng đơn trong ngắn hạn, đồng thời vẫn vượt ngưỡng lợi nhuận tối thiểu.";
        } else {
            expectedImpact = "Kỳ vọng tăng tỷ lệ chuyển đổi nhưng vẫn giữ biên lợi nhuận an toàn.";
        }

        String campaignName = discount <= 0 ? "AI kiểm tra giá vốn - " + productName : "AI Sale " + productName;

        return new AdminAiPromotionSuggestionResponse(
                product.getId(),
                productName,
                product.getCategory() != null ? product.getCategory().getName() : "",
                product.getBrand() != null ? product.getBrand().getName() : "",
                product.getSport() != null ? product.getSport().getName() : "",
                totalStock,
                productAgeDays,
                ageRule.lifecycleStatus(),
                ageRule.ageRuleApplied(),
                ageRule.warning(),
                sales.quantitySold(),
                sales.revenue(),
                discount,
                originalDiscount,
                protection.maxAllowedDiscountPercent(),
                round(protection.minProfitPerUnitAfterDiscount()),
                round(protection.minProfitMarginPercentAfterDiscount()),
                protection.profitProtected(),
                protection.discountAdjusted(),
                protection.profitWarning(),
                priority,
                round(score),
                hasActivePromotion,
                reason,
                expectedImpact,
                campaignName
        );
    }

    private String buildLocalPromotionSummary(List<AdminAiPromotionSuggestionResponse> suggestions) {
        if (suggestions.isEmpty()) {
            return "Chưa có sản phẩm nào đủ điều kiện để gợi ý khuyến mãi. Hãy kiểm tra thêm dữ liệu đơn hàng và tồn kho.";
        }

        long highPriority = suggestions.stream().filter(item -> "HIGH".equals(item.priority())).count();
        long blockedByProfit = suggestions.stream()
                .filter(item -> item.suggestedDiscountPercent() == null || item.suggestedDiscountPercent() <= 0)
                .count();

        long ageRuleApplied = suggestions.stream()
                .filter(item -> Boolean.TRUE.equals(item.ageRuleApplied()))
                .count();

        return "AI tìm thấy " + suggestions.size() + " sản phẩm nên cân nhắc khuyến mãi, trong đó có "
                + highPriority + " sản phẩm ưu tiên cao. Có " + blockedByProfit
                + " sản phẩm đang bị chặn/hạ mức giảm để tránh bán dưới giá nhập hoặc dưới biên lợi nhuận tối thiểu. "
                + "Hệ thống đã loại trừ sản phẩm mới dưới " + NEW_PRODUCT_PROTECTED_DAYS
                + " ngày và có " + ageRuleApplied + " sản phẩm mới được áp dụng giới hạn giảm nhẹ.";
    }

    private String buildDashboardPrompt(DashboardSnapshot snapshot) throws Exception {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", snapshot.period());
        data.put("periodLabel", snapshot.periodLabel());
        data.put("totalRevenue", snapshot.totalRevenue());
        data.put("previousRevenue", snapshot.previousRevenue());
        data.put("revenueGrowthPercent", snapshot.revenueGrowthPercent());
        data.put("totalOrders", snapshot.totalOrders());
        data.put("previousTotalOrders", snapshot.previousTotalOrders());
        data.put("orderGrowthPercent", snapshot.orderGrowthPercent());
        data.put("pendingOrders", snapshot.pendingOrders());
        data.put("cancelledOrders", snapshot.cancelledOrders());
        data.put("deliveredOrders", snapshot.deliveredOrders());
        data.put("pendingRate", snapshot.pendingRate());
        data.put("cancelRate", snapshot.cancelRate());
        data.put("averageOrderValue", snapshot.averageOrderValue());
        data.put("topPaymentMethod", snapshot.topPaymentMethod());
        data.put("orderStatusStats", snapshot.orderStatusStats());
        data.put("paymentStats", snapshot.paymentStats());
        data.put("topProducts", snapshot.topProducts().stream().map(this::productPerformanceToMap).toList());
        data.put("lowStockProducts", snapshot.lowStockProducts().stream().map(this::lowStockItemToMap).toList());
        data.put("slowMovingProducts", snapshot.slowMovingProducts().stream().map(this::productPerformanceToMap).toList());

        return """
                Bạn là AI phân tích kinh doanh cho trang quản trị Sportwear Shop.

                Nhiệm vụ:
                - Phân tích dashboard dựa trên JSON được cung cấp.
                - Không bịa số liệu ngoài JSON.
                - Viết bằng tiếng Việt, ngắn gọn, có hành động cụ thể.
                - Nếu có đơn PENDING, tồn kho thấp, doanh thu giảm hoặc tỷ lệ hủy cao thì phải cảnh báo.
                - Trả về JSON hợp lệ, không markdown.

                Schema bắt buộc:
                {
                  "overview": "string",
                  "highlights": ["string"],
                  "warnings": ["string"],
                  "recommendations": ["string"],
                  "priorityActions": [
                    {
                      "title": "string",
                      "description": "string",
                      "priority": "LOW | MEDIUM | HIGH"
                    }
                  ]
                }

                Dữ liệu dashboard:
                %s
                """.formatted(toPrettyJson(data));
    }

    private String buildPromotionPrompt(List<AdminAiPromotionSuggestionResponse> localSuggestions) throws Exception {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ruleBasedSuggestions", localSuggestions);

        return """
                Bạn là AI quản lý khuyến mãi cho Sportwear Shop.

                Nhiệm vụ:
                - Dựa vào danh sách gợi ý đã được backend chấm điểm bằng rule-based scoring.
                - Backend đã kiểm tra tuổi đời sản phẩm: sản phẩm mới dưới 14 ngày bị loại, sản phẩm 14-29 ngày chỉ được giảm nhẹ khi tồn kho rất cao và chưa bán được.
                - Không thêm sản phẩm ngoài danh sách.
                - Có thể viết lại reason, expectedImpact, suggestedCampaignName cho thuyết phục hơn.
                - Không gợi ý giảm giá cho sản phẩm hết hàng.
                - Nếu sản phẩm đã có khuyến mãi, hãy nhấn mạnh là nên kiểm tra hiệu quả thay vì tạo trùng.
                - Không được tự tăng suggestedDiscountPercent. Mức giảm này đã được backend chặn theo giá nhập và biên lợi nhuận tối thiểu.
                - originalSuggestedDiscountPercent là mức AI rule-based ban đầu; suggestedDiscountPercent là mức cuối cùng an toàn để áp dụng.
                - Nếu suggestedDiscountPercent = 0 thì không khuyến nghị giảm giá trực tiếp, chỉ nêu hành động thay thế.
                - profitWarning, maxAllowedDiscountPercent, minProfitPerUnitAfterDiscount, minProfitMarginPercentAfterDiscount là dữ liệu an toàn lợi nhuận, không được sửa sai lệch.
                - productAgeDays, productLifecycleStatus, ageRuleApplied, ageRuleWarning là dữ liệu kiểm tra tuổi đời sản phẩm, không được sửa sai lệch.
                - Trả về JSON hợp lệ, không markdown.

                Schema bắt buộc:
                {
                  "summary": "string",
                  "suggestions": [
                    {
                      "productId": 0,
                      "productName": "string",
                      "category": "string",
                      "brand": "string",
                      "sport": "string",
                      "totalStock": 0,
                      "productAgeDays": 0,
                      "productLifecycleStatus": "NEW_PROTECTED | NEW_WATCHLIST | NORMAL | OLD_SLOW",
                      "ageRuleApplied": false,
                      "ageRuleWarning": "string",
                      "soldLast30Days": 0,
                      "revenueLast30Days": 0,
                      "suggestedDiscountPercent": 0,
                      "originalSuggestedDiscountPercent": 0,
                      "maxAllowedDiscountPercent": 0,
                      "minProfitPerUnitAfterDiscount": 0,
                      "minProfitMarginPercentAfterDiscount": 0,
                      "profitProtected": true,
                      "discountAdjusted": false,
                      "profitWarning": "string",
                      "priority": "LOW | MEDIUM | HIGH",
                      "score": 0.0,
                      "hasActivePromotion": false,
                      "reason": "string",
                      "expectedImpact": "string",
                      "suggestedCampaignName": "string"
                    }
                  ]
                }

                Dữ liệu:
                %s
                """.formatted(toPrettyJson(data));
    }

    private AdminAiDashboardInsightResponse parseDashboardInsight(String text) throws Exception {
        Map<String, Object> map = parseJsonObject(text);
        if (map == null) return null;

        return new AdminAiDashboardInsightResponse(
                getString(map, "overview"),
                getStringList(map, "highlights"),
                getStringList(map, "warnings"),
                getStringList(map, "recommendations"),
                getPriorityActions(map.get("priorityActions")),
                SOURCE_GEMINI_GROUNDED
        );
    }


    private Map<String, Object> productPerformanceToMap(ProductPerformance item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("productId", item.productId());
        map.put("productName", item.productName());
        map.put("quantitySold", item.quantitySold());
        map.put("revenue", item.revenue());
        map.put("stockQuantity", item.stockQuantity());
        return map;
    }

    private Map<String, Object> lowStockItemToMap(LowStockItem item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("productId", item.productId());
        map.put("productName", item.productName());
        map.put("size", item.size());
        map.put("color", item.color());
        map.put("stockQuantity", item.stockQuantity());
        return map;
    }

    private AdminAiPromotionSuggestionsResponse parsePromotionSuggestions(String text,
                                                                          List<AdminAiPromotionSuggestionResponse> localSuggestions) throws Exception {
        Map<String, Object> map = parseJsonObject(text);
        if (map == null) return null;

        List<AdminAiPromotionSuggestionResponse> suggestions = getPromotionSuggestionList(
                map.get("suggestions"),
                localSuggestions
        );

        if (suggestions.isEmpty()) {
            suggestions = localSuggestions;
        }

        return new AdminAiPromotionSuggestionsResponse(
                getString(map, "summary"),
                suggestions,
                SOURCE_GEMINI_GROUNDED
        );
    }

    private List<AdminAiPromotionSuggestionResponse> getPromotionSuggestionList(Object value,
                                                                                List<AdminAiPromotionSuggestionResponse> localSuggestions) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }

        Map<Long, AdminAiPromotionSuggestionResponse> localById = localSuggestions.stream()
                .collect(Collectors.toMap(AdminAiPromotionSuggestionResponse::productId, item -> item, (a, b) -> a));

        List<AdminAiPromotionSuggestionResponse> result = new ArrayList<>();

        for (Object item : list) {
            if (!(item instanceof Map<?, ?> rawMap)) continue;

            Long productId = getLong(rawMap, "productId");
            AdminAiPromotionSuggestionResponse local = localById.get(productId);
            if (local == null) continue;

            result.add(new AdminAiPromotionSuggestionResponse(
                    local.productId(),
                    getString(rawMap, "productName", local.productName()),
                    getString(rawMap, "category", local.category()),
                    getString(rawMap, "brand", local.brand()),
                    getString(rawMap, "sport", local.sport()),
                    getInteger(rawMap, "totalStock", local.totalStock()),
                    local.productAgeDays(),
                    local.productLifecycleStatus(),
                    local.ageRuleApplied(),
                    local.ageRuleWarning(),
                    getInteger(rawMap, "soldLast30Days", local.soldLast30Days()),
                    getDouble(rawMap, "revenueLast30Days", local.revenueLast30Days()),
                    local.suggestedDiscountPercent(),
                    local.originalSuggestedDiscountPercent(),
                    local.maxAllowedDiscountPercent(),
                    local.minProfitPerUnitAfterDiscount(),
                    local.minProfitMarginPercentAfterDiscount(),
                    local.profitProtected(),
                    local.discountAdjusted(),
                    local.profitWarning(),
                    normalizePriority(getString(rawMap, "priority", local.priority())),
                    getDouble(rawMap, "score", local.score()),
                    getBoolean(rawMap, "hasActivePromotion", local.hasActivePromotion()),
                    getString(rawMap, "reason", local.reason()),
                    getString(rawMap, "expectedImpact", local.expectedImpact()),
                    getString(rawMap, "suggestedCampaignName", local.suggestedCampaignName())
            ));
        }

        return result;
    }

    private String askGemini(String prompt, int maxOutputTokens, double temperature) {
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
                        "temperature", temperature,
                        "topP", 0.9,
                        "maxOutputTokens", maxOutputTokens
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
    }

    private String extractGeminiText(Map<String, Object> response) {
        if (response == null) return null;

        Object candidatesObject = response.get("candidates");
        if (!(candidatesObject instanceof List<?> candidates) || candidates.isEmpty()) return null;

        Object firstCandidate = candidates.get(0);
        if (!(firstCandidate instanceof Map<?, ?> candidateMap)) return null;

        Object contentObject = candidateMap.get("content");
        if (!(contentObject instanceof Map<?, ?> contentMap)) return null;

        Object partsObject = contentMap.get("parts");
        if (!(partsObject instanceof List<?> parts) || parts.isEmpty()) return null;

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

    private Map<String, Object> parseJsonObject(String text) throws Exception {
        String json = extractJson(text);
        if (!AiTextNormalizer.hasText(json)) return null;
        return objectMapper.readValue(json, new TypeReference<>() {
        });
    }

    private String extractJson(String text) {
        if (!AiTextNormalizer.hasText(text)) return null;

        String cleaned = text.trim()
                .replace("```json", "")
                .replace("```", "")
                .trim();

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        return cleaned.substring(start, end + 1);
    }

    private boolean canUseGemini() {
        return aiEnabled && AiTextNormalizer.hasText(geminiApiKey);
    }

    private PeriodRange buildCurrentRange(String period, String date, String month, Integer year) {
        LocalDateTime now = LocalDateTime.now();

        if ("day".equals(period)) {
            java.time.LocalDate selectedDate = parseDate(date, now.toLocalDate());
            LocalDateTime start = selectedDate.atStartOfDay();
            return new PeriodRange(start, start.plusDays(1), "ngày " + selectedDate);
        }

        if ("year".equals(period)) {
            int selectedYear = year != null ? year : now.getYear();
            LocalDateTime start = LocalDateTime.of(selectedYear, 1, 1, 0, 0);
            return new PeriodRange(start, start.plusYears(1), "năm " + selectedYear);
        }

        if ("all".equals(period)) {
            return new PeriodRange(LocalDateTime.of(2000, 1, 1, 0, 0), now.plusDays(1), "toàn bộ thời gian");
        }

        YearMonth selectedMonth = parseYearMonth(month, YearMonth.from(now));
        LocalDateTime start = selectedMonth.atDay(1).atStartOfDay();
        return new PeriodRange(start, start.plusMonths(1), "tháng " + selectedMonth.getMonthValue() + "/" + selectedMonth.getYear());
    }

    private java.time.LocalDate parseDate(String value, java.time.LocalDate fallback) {
        try {
            if (AiTextNormalizer.hasText(value)) {
                return java.time.LocalDate.parse(value);
            }
        } catch (Exception ignored) {
        }
        return fallback;
    }

    private YearMonth parseYearMonth(String value, YearMonth fallback) {
        try {
            if (AiTextNormalizer.hasText(value)) {
                return YearMonth.parse(value);
            }
        } catch (Exception ignored) {
        }
        return fallback;
    }

    private PeriodRange buildPreviousRange(PeriodRange currentRange, String period) {
        if ("day".equals(period)) {
            return new PeriodRange(currentRange.start().minusDays(1), currentRange.start(), "ngày trước");
        }

        if ("year".equals(period)) {
            return new PeriodRange(currentRange.start().minusYears(1), currentRange.start(), "năm trước");
        }

        if ("all".equals(period)) {
            return new PeriodRange(currentRange.start(), currentRange.start(), "kỳ trước");
        }

        return new PeriodRange(currentRange.start().minusMonths(1), currentRange.start(), "tháng trước");
    }

    private List<Order> filterOrdersByRange(List<Order> orders, LocalDateTime start, LocalDateTime end) {
        return orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .filter(order -> !order.getCreatedAt().isBefore(start))
                .filter(order -> order.getCreatedAt().isBefore(end))
                .toList();
    }

    private double sumOrderRevenue(List<Order> orders) {
        return orders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private long countByStatus(List<Order> orders, String status) {
        return orders.stream()
                .filter(order -> order.getStatus() != null)
                .filter(order -> status.equals(order.getStatus().name()))
                .count();
    }

    private Map<Long, ProductSales> buildProductSales(List<OrderItem> orderItems, LocalDateTime start, LocalDateTime end) {
        Map<Long, ProductSales> salesMap = new HashMap<>();

        for (OrderItem item : orderItems) {
            if (item.getOrder() == null || item.getOrder().getCreatedAt() == null) continue;
            if (item.getProductVariant() == null || item.getProductVariant().getProduct() == null) continue;

            LocalDateTime createdAt = item.getOrder().getCreatedAt();
            if (createdAt.isBefore(start) || !createdAt.isBefore(end)) continue;

            Long productId = item.getProductVariant().getProduct().getId();
            int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
            double price = item.getFinalPrice() != null ? item.getFinalPrice()
                    : item.getPrice() != null ? item.getPrice()
                    : item.getOriginalPrice() != null ? item.getOriginalPrice()
                    : 0.0;

            ProductSales current = salesMap.getOrDefault(productId, new ProductSales(0, 0.0));
            salesMap.put(productId, new ProductSales(
                    current.quantitySold() + quantity,
                    current.revenue() + price * quantity
            ));
        }

        return salesMap;
    }

    private List<ProductPerformance> buildTopProducts(List<OrderItem> orderItems, List<Order> periodOrders) {
        Set<Long> periodOrderIds = periodOrders.stream()
                .map(Order::getId)
                .collect(Collectors.toSet());

        Map<Long, ProductPerformanceAccumulator> map = new HashMap<>();

        for (OrderItem item : orderItems) {
            if (item.getOrder() == null || !periodOrderIds.contains(item.getOrder().getId())) continue;
            if (item.getProductVariant() == null || item.getProductVariant().getProduct() == null) continue;

            Product product = item.getProductVariant().getProduct();
            int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
            double price = item.getFinalPrice() != null ? item.getFinalPrice()
                    : item.getPrice() != null ? item.getPrice()
                    : item.getOriginalPrice() != null ? item.getOriginalPrice()
                    : 0.0;

            ProductPerformanceAccumulator acc = map.computeIfAbsent(product.getId(), id ->
                    new ProductPerformanceAccumulator(product.getId(), product.getName())
            );

            acc.quantitySold += quantity;
            acc.revenue += price * quantity;
        }

        return map.values()
                .stream()
                .map(acc -> new ProductPerformance(acc.productId, acc.productName, acc.quantitySold, acc.revenue, 0))
                .sorted(Comparator.comparing(ProductPerformance::quantitySold).reversed())
                .toList();
    }

    private List<ProductPerformance> buildSlowMovingProducts(List<OrderItem> orderItems, List<ProductVariant> variants) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);
        Map<Long, ProductSales> salesByProductId = buildProductSales(orderItems, last30Days, now);

        Map<Long, ProductPerformanceAccumulator> stockMap = new HashMap<>();

        for (ProductVariant variant : variants) {
            if (variant.getProduct() == null || variant.getProduct().getId() == null) continue;

            Product product = variant.getProduct();
            ProductPerformanceAccumulator acc = stockMap.computeIfAbsent(product.getId(), id ->
                    new ProductPerformanceAccumulator(product.getId(), product.getName())
            );

            acc.stock += variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        }

        return stockMap.values()
                .stream()
                .map(acc -> {
                    ProductSales sales = salesByProductId.getOrDefault(acc.productId, new ProductSales(0, 0.0));
                    return new ProductPerformance(acc.productId, acc.productName, sales.quantitySold(), sales.revenue(), acc.stock);
                })
                .filter(item -> item.stockQuantity() >= 20 && item.quantitySold() <= 5)
                .sorted(Comparator.comparing(ProductPerformance::stockQuantity).reversed())
                .limit(8)
                .toList();
    }

    private ActivePromotionIndex buildActivePromotionIndex(List<Promotion> promotions,
                                                           List<PromotionTarget> targets,
                                                           LocalDateTime now) {
        Set<Long> activePromotionIds = promotions.stream()
                .filter(promotion -> Boolean.TRUE.equals(promotion.getIsActive()))
                .filter(promotion -> promotion.getStatus() != null)
                .filter(promotion -> "ACTIVE".equals(promotion.getStatus().name()) || "SCHEDULED".equals(promotion.getStatus().name()))
                .filter(promotion -> promotion.getEndTime() == null || !promotion.getEndTime().isBefore(now))
                .map(Promotion::getId)
                .collect(Collectors.toSet());

        ActivePromotionIndex index = new ActivePromotionIndex();

        for (PromotionTarget target : targets) {
            if (target.getPromotion() == null || !activePromotionIds.contains(target.getPromotion().getId())) continue;
            if (target.getTargetType() == null || target.getTargetId() == null) continue;

            if (target.getTargetType() == PromotionTargetType.PRODUCT) {
                index.productIds.add(target.getTargetId());
            } else if (target.getTargetType() == PromotionTargetType.PRODUCT_VARIANT) {
                index.variantIds.add(target.getTargetId());
            } else if (target.getTargetType() == PromotionTargetType.CATEGORY) {
                index.categoryIds.add(target.getTargetId());
            } else if (target.getTargetType() == PromotionTargetType.BRAND) {
                index.brandIds.add(target.getTargetId());
            } else if (target.getTargetType() == PromotionTargetType.SPORT) {
                index.sportIds.add(target.getTargetId());
            }
        }

        return index;
    }

    private LowStockItem toLowStockItem(ProductVariant variant) {
        Product product = variant.getProduct();

        return new LowStockItem(
                product != null ? product.getId() : null,
                product != null ? product.getName() : "Sản phẩm",
                variant.getSize(),
                variant.getColor(),
                variant.getStockQuantity() != null ? variant.getStockQuantity() : 0
        );
    }

    private int calculateProductAgeDays(Product product) {
        if (product == null || product.getCreatedAt() == null) {
            return NORMAL_PROMOTION_MIN_AGE_DAYS;
        }

        long days = ChronoUnit.DAYS.between(product.getCreatedAt().toLocalDate(), LocalDateTime.now().toLocalDate());
        if (days < 0) return 0;
        return (int) Math.min(days, Integer.MAX_VALUE);
    }

    private ProductAgeRuleResult evaluateProductAgeRule(int productAgeDays, int totalStock, int soldLast30Days) {
        if (productAgeDays < NEW_PRODUCT_PROTECTED_DAYS) {
            return new ProductAgeRuleResult(
                    false,
                    "NEW_PROTECTED",
                    true,
                    0,
                    "AI không xét giảm giá vì sản phẩm mới được thêm " + productAgeDays
                            + " ngày, chưa đủ dữ liệu để đánh giá là bán chậm."
            );
        }

        if (productAgeDays < NORMAL_PROMOTION_MIN_AGE_DAYS) {
            boolean exceptionalCase = totalStock >= NEW_PRODUCT_EXCEPTION_STOCK_THRESHOLD && soldLast30Days == 0;
            if (!exceptionalCase) {
                return new ProductAgeRuleResult(
                        false,
                        "NEW_PROTECTED",
                        true,
                        0,
                        "AI không xét giảm giá vì sản phẩm mới được thêm " + productAgeDays
                                + " ngày và chưa đủ thời gian bán tối thiểu " + NORMAL_PROMOTION_MIN_AGE_DAYS + " ngày."
                );
            }

            return new ProductAgeRuleResult(
                    true,
                    "NEW_WATCHLIST",
                    true,
                    NEW_PRODUCT_MAX_DISCOUNT_PERCENT,
                    "Sản phẩm mới " + productAgeDays + " ngày nhưng tồn kho rất cao và chưa có đơn, AI chỉ cho phép giảm nhẹ tối đa "
                            + NEW_PRODUCT_MAX_DISCOUNT_PERCENT + "% để kiểm tra nhu cầu."
            );
        }

        if (productAgeDays >= 60 && soldLast30Days <= 5) {
            return new ProductAgeRuleResult(
                    true,
                    "OLD_SLOW",
                    false,
                    null,
                    "Sản phẩm đã bán hơn 60 ngày nhưng doanh số 30 ngày thấp, có thể ưu tiên khuyến mãi."
            );
        }

        return new ProductAgeRuleResult(true, "NORMAL", false, null, "");
    }

    private double calculateProductMaturityScore(int productAgeDays) {
        if (productAgeDays < NEW_PRODUCT_PROTECTED_DAYS) return 0.0;
        if (productAgeDays < NORMAL_PROMOTION_MIN_AGE_DAYS) return 0.25;
        if (productAgeDays < 60) return 0.70;
        return 1.0;
    }

    private ProfitProtectionResult calculateProfitProtection(List<ProductVariant> variants, int originalDiscountPercent) {
        List<ProductVariant> stockedVariants = variants.stream()
                .filter(Objects::nonNull)
                .filter(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() > 0)
                .toList();

        if (stockedVariants.isEmpty()) {
            return new ProfitProtectionResult(
                    0,
                    0,
                    0.0,
                    0.0,
                    false,
                    originalDiscountPercent > 0,
                    "Không có biến thể còn tồn kho để tính lợi nhuận an toàn."
            );
        }

        boolean missingCostOrPrice = stockedVariants.stream().anyMatch(variant ->
                variant.getPrice() == null
                        || variant.getPrice() <= 0
                        || variant.getCostPrice() == null
                        || variant.getCostPrice() <= 0
        );

        if (missingCostOrPrice) {
            return new ProfitProtectionResult(
                    0,
                    0,
                    0.0,
                    0.0,
                    false,
                    originalDiscountPercent > 0,
                    "AI chưa cho phép giảm giá vì một số biến thể còn tồn kho đang thiếu giá nhập hoặc giá bán hợp lệ."
            );
        }

        int maxAllowedDiscountPercent = 100;

        for (ProductVariant variant : stockedVariants) {
            double price = variant.getPrice();
            double costPrice = variant.getCostPrice();
            double minimumSafePrice = costPrice * (1.0 + MIN_PROFIT_MARGIN_RATE);
            double allowedPercent = ((price - minimumSafePrice) * 100.0) / price;
            int variantMaxDiscount = (int) Math.floor(Math.max(0.0, Math.min(90.0, allowedPercent)));
            maxAllowedDiscountPercent = Math.min(maxAllowedDiscountPercent, variantMaxDiscount);
        }

        int safeDiscountPercent = Math.min(originalDiscountPercent, maxAllowedDiscountPercent);
        if (safeDiscountPercent < MIN_SAFE_DISCOUNT_PERCENT) {
            safeDiscountPercent = 0;
        }

        double minProfitPerUnitAfterDiscount = Double.MAX_VALUE;
        double minProfitMarginPercentAfterDiscount = Double.MAX_VALUE;

        for (ProductVariant variant : stockedVariants) {
            double finalPrice = variant.getPrice() * (1.0 - safeDiscountPercent / 100.0);
            double profitPerUnit = finalPrice - variant.getCostPrice();
            double marginPercent = finalPrice <= 0 ? 0.0 : (profitPerUnit * 100.0) / finalPrice;
            minProfitPerUnitAfterDiscount = Math.min(minProfitPerUnitAfterDiscount, profitPerUnit);
            minProfitMarginPercentAfterDiscount = Math.min(minProfitMarginPercentAfterDiscount, marginPercent);
        }

        boolean adjusted = safeDiscountPercent != originalDiscountPercent;
        String warning = "";
        if (safeDiscountPercent <= 0) {
            warning = "AI chặn giảm giá trực tiếp vì mức giảm an toàn nhỏ hơn " + MIN_SAFE_DISCOUNT_PERCENT
                    + "% hoặc có nguy cơ thấp hơn giá nhập/biên lợi nhuận tối thiểu.";
        } else if (adjusted) {
            warning = "AI đã hạ mức giảm để giá sau khuyến mãi vẫn cao hơn giá nhập và giữ tối thiểu "
                    + Math.round(MIN_PROFIT_MARGIN_RATE * 100) + "% biên lợi nhuận.";
        }

        return new ProfitProtectionResult(
                safeDiscountPercent,
                maxAllowedDiscountPercent,
                minProfitPerUnitAfterDiscount,
                minProfitMarginPercentAfterDiscount,
                true,
                adjusted,
                warning
        );
    }

    private double calculateSlowScore(int quantitySold) {
        if (quantitySold <= 0) return 1.0;
        if (quantitySold <= 3) return 0.92;
        if (quantitySold <= 5) return 0.85;
        if (quantitySold <= 10) return 0.62;
        if (quantitySold <= 20) return 0.35;
        return 0.05;
    }

    private double calculateRevenueLowScore(double revenue) {
        if (revenue <= 0) return 1.0;
        if (revenue < 1_000_000) return 0.9;
        if (revenue < 3_000_000) return 0.7;
        if (revenue < 7_000_000) return 0.45;
        return 0.12;
    }

    private int suggestDiscountPercent(double score, int stock, int soldLast30Days, boolean hasActivePromotion) {
        if (hasActivePromotion) return 5;
        if (score >= 0.86 && stock >= 80 && soldLast30Days <= 2) return 25;
        if (score >= 0.76) return 20;
        if (score >= 0.60) return 15;
        return 10;
    }

    private record ProfitProtectionResult(
            int safeDiscountPercent,
            int maxAllowedDiscountPercent,
            double minProfitPerUnitAfterDiscount,
            double minProfitMarginPercentAfterDiscount,
            boolean profitProtected,
            boolean discountAdjusted,
            String profitWarning
    ) {
    }

    private record ProductAgeRuleResult(
            boolean eligible,
            String lifecycleStatus,
            boolean ageRuleApplied,
            Integer maxDiscountPercent,
            String warning
    ) {
    }

    private double growthPercent(double current, double previous) {
        if (previous == 0 && current > 0) return 100.0;
        if (previous == 0) return 0.0;
        return (current - previous) * 100.0 / previous;
    }

    private String normalizePeriod(String period) {
        String value = safe(period).toLowerCase();
        if ("day".equals(value) || "month".equals(value) || "year".equals(value) || "all".equals(value)) {
            return value;
        }
        return "month";
    }

    private String normalizePriority(String priority) {
        String value = safe(priority).toUpperCase();
        if ("LOW".equals(value) || "MEDIUM".equals(value) || "HIGH".equals(value)) {
            return value;
        }
        return "MEDIUM";
    }

    private String toPrettyJson(Object value) throws Exception {
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
    }

    private String getString(Map<String, Object> map, String key) {
        return getString(map, key, "");
    }

    private String getString(Map<?, ?> map, String key, String fallback) {
        Object value = map.get(key);
        return value == null ? fallback : String.valueOf(value);
    }

    private List<String> getStringList(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (!(value instanceof List<?> list)) return List.of();

        return list.stream()
                .map(String::valueOf)
                .filter(AiTextNormalizer::hasText)
                .toList();
    }

    private List<AdminAiPriorityActionResponse> getPriorityActions(Object value) {
        if (!(value instanceof List<?> list)) return List.of();

        List<AdminAiPriorityActionResponse> result = new ArrayList<>();

        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) continue;

            result.add(new AdminAiPriorityActionResponse(
                    getString(map, "title", ""),
                    getString(map, "description", ""),
                    normalizePriority(getString(map, "priority", "MEDIUM"))
            ));
        }

        return result;
    }

    private Long getLong(Map<?, ?> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number number) return number.longValue();

        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception exception) {
            return null;
        }
    }

    private Integer getInteger(Map<?, ?> map, String key, Integer fallback) {
        Object value = map.get(key);
        if (value instanceof Number number) return number.intValue();

        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception exception) {
            return fallback;
        }
    }

    private Double getDouble(Map<?, ?> map, String key, Double fallback) {
        Object value = map.get(key);
        if (value instanceof Number number) return number.doubleValue();

        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception exception) {
            return fallback;
        }
    }

    private Boolean getBoolean(Map<?, ?> map, String key, Boolean fallback) {
        Object value = map.get(key);
        if (value instanceof Boolean bool) return bool;
        if (value == null) return fallback;
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String formatPercent(double value) {
        return String.format("%.1f%%", value);
    }

    private String formatMoney(double value) {
        return String.format("%,.0fđ", value);
    }

    private record PeriodRange(LocalDateTime start, LocalDateTime end, String label) {
    }

    private record DashboardSnapshot(
            String period,
            String periodLabel,
            double totalRevenue,
            double previousRevenue,
            double revenueGrowthPercent,
            long totalOrders,
            long previousTotalOrders,
            double orderGrowthPercent,
            long pendingOrders,
            long cancelledOrders,
            long deliveredOrders,
            double pendingRate,
            double cancelRate,
            double averageOrderValue,
            String topPaymentMethod,
            Map<String, Long> orderStatusStats,
            Map<String, Long> paymentStats,
            List<ProductPerformance> topProducts,
            List<LowStockItem> lowStockProducts,
            List<ProductPerformance> slowMovingProducts
    ) {
    }

    private record ProductSales(int quantitySold, double revenue) {
    }

    private record ProductPerformance(
            Long productId,
            String productName,
            int quantitySold,
            double revenue,
            int stockQuantity
    ) {
    }

    private record LowStockItem(
            Long productId,
            String productName,
            String size,
            String color,
            int stockQuantity
    ) {
    }

    private static class ProductPerformanceAccumulator {
        private final Long productId;
        private final String productName;
        private int quantitySold;
        private double revenue;
        private int stock;

        private ProductPerformanceAccumulator(Long productId, String productName) {
            this.productId = productId;
            this.productName = productName;
        }
    }

    private static class ActivePromotionIndex {
        private final Set<Long> productIds = new HashSet<>();
        private final Set<Long> variantIds = new HashSet<>();
        private final Set<Long> categoryIds = new HashSet<>();
        private final Set<Long> brandIds = new HashSet<>();
        private final Set<Long> sportIds = new HashSet<>();

        private boolean matchesProduct(Product product, List<ProductVariant> variants) {
            if (product == null || product.getId() == null) return false;

            if (productIds.contains(product.getId())) return true;
            if (product.getCategory() != null && categoryIds.contains(product.getCategory().getId())) return true;
            if (product.getBrand() != null && brandIds.contains(product.getBrand().getId())) return true;
            if (product.getSport() != null && sportIds.contains(product.getSport().getId())) return true;

            return variants.stream()
                    .map(ProductVariant::getId)
                    .filter(Objects::nonNull)
                    .anyMatch(variantIds::contains);
        }
    }
}
