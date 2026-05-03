package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.ai.AiProductSuggestionResponse;
import com.nguyenhuuquan.sportwearshop.dto.ai.ProductFactAnswer;
import com.nguyenhuuquan.sportwearshop.entity.AiConversation;
import com.nguyenhuuquan.sportwearshop.entity.AiSuggestedProduct;
import com.nguyenhuuquan.sportwearshop.entity.ProductAiDocument;
import com.nguyenhuuquan.sportwearshop.repository.ProductAiDocumentRepository;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProductFactAnswerService {

    private final AiConversationMemoryService aiConversationMemoryService;
    private final ProductAiDocumentRepository productAiDocumentRepository;

    public ProductFactAnswerService(AiConversationMemoryService aiConversationMemoryService,
                                    ProductAiDocumentRepository productAiDocumentRepository) {
        this.aiConversationMemoryService = aiConversationMemoryService;
        this.productAiDocumentRepository = productAiDocumentRepository;
    }

    @Transactional(readOnly = true)
    public Optional<ProductFactAnswer> tryAnswer(String message, AiConversation conversation) {
        String normalized = AiTextNormalizer.normalize(message);
        Set<String> tokens = AiTextNormalizer.tokens(normalized);

        /*
         * FIX V2:
         * Chặn các câu TÌM SẢN PHẨM MỚI trước khi kiểm tra size/màu/giá.
         *
         * Ví dụ phải đi sang ProductAiSearchService:
         * - "tôi cần tìm 1 mẫu áo có màu vàng"
         * - "tìm áo thể thao màu đỏ"
         * - "áo màu vàng"
         * - "giày size 42 dưới 1 triệu"
         *
         * Ví dụ vẫn là hỏi sản phẩm đã gợi ý:
         * - "áo này có màu vàng không"
         * - "mẫu đầu tiên có size gì"
         * - "đôi đó giá bao nhiêu"
         */
        if (isNewProductSearchRequest(normalized, tokens)) {
            return Optional.empty();
        }

        boolean asksSize = asksSize(normalized);
        boolean asksColor = asksColor(normalized);
        boolean asksPrice = asksPrice(normalized);
        boolean asksStock = asksStock(normalized);
        boolean asksPromotion = asksPromotion(normalized);

        if (!asksSize && !asksColor && !asksPrice && !asksStock && !asksPromotion) {
            return Optional.empty();
        }

        List<AiSuggestedProduct> latestSuggestions = aiConversationMemoryService.getLatestSuggestedProducts(conversation);

        if (latestSuggestions.isEmpty()) {
            /*
             * Nếu chưa có sản phẩm đã gợi ý, chỉ hỏi lại khi câu hỏi thật sự phụ thuộc
             * vào ngữ cảnh như "áo này", "mẫu đó", "đôi đầu tiên".
             */
            if (hasReferenceWord(normalized) || asksOnlyFactWithoutProductIntent(normalized, tokens)) {
                String reply = "Bạn đang hỏi thông tin của sản phẩm nào vậy? Bạn có thể gửi tên sản phẩm hoặc chọn một mẫu mình đã gợi ý để mình kiểm tra size, màu, giá và tồn kho chính xác hơn.";
                return Optional.of(new ProductFactAnswer(reply, List.of()));
            }

            return Optional.empty();
        }

        AiSuggestedProduct selected = selectSuggestedProduct(normalized, latestSuggestions);
        if (selected == null || selected.getProductId() == null) {
            String reply = "Bạn muốn hỏi sản phẩm thứ mấy trong danh sách mình vừa gợi ý? Ví dụ: \"mẫu đầu tiên còn size 42 không?\"";
            return Optional.of(new ProductFactAnswer(reply, List.of()));
        }

        Optional<ProductAiDocument> documentOptional = productAiDocumentRepository.findByProductId(selected.getProductId());
        if (documentOptional.isEmpty()) {
            String reply = "Mình chưa lấy lại được dữ liệu chi tiết của sản phẩm vừa gợi ý. Bạn thử gửi tên sản phẩm để mình tìm lại nhé.";
            return Optional.of(new ProductFactAnswer(reply, List.of()));
        }

        ProductAiDocument document = documentOptional.get();
        String reply = buildFactReply(normalized, document, asksSize, asksColor, asksPrice, asksStock, asksPromotion);

        return Optional.of(new ProductFactAnswer(reply, List.of(toSuggestion(document))));
    }

    private boolean isNewProductSearchRequest(String normalized, Set<String> tokens) {
        boolean hasSearchOrBuyingWord = containsAny(tokens,
                "tim", "kiem", "mua", "can", "muon", "goi", "y", "tu", "van", "chon",
                "recommend", "suggest", "lay", "loc")
                || normalized.contains("can tim")
                || normalized.contains("tim cho toi")
                || normalized.contains("goi y")
                || normalized.contains("tu van")
                || normalized.contains("toi can")
                || normalized.contains("toi muon")
                || normalized.contains("dang hoi ban toi can tim")
                || normalized.contains("dang bao ban tim");

        boolean hasProductWord = hasProductWord(normalized, tokens);

        boolean hasFilterWord = hasColorFilter(normalized, tokens)
                || hasSizeFilter(normalized)
                || hasPriceFilter(normalized)
                || hasGenderFilter(tokens)
                || asksPromotion(normalized)
                || normalized.contains("the thao")
                || normalized.contains("bong da")
                || normalized.contains("chay bo")
                || normalized.contains("tap gym")
                || normalized.contains("cau long");

        /*
         * Case 1: "tôi cần tìm áo màu vàng"
         * Có từ tìm/mua/cần + có loại sản phẩm => search.
         */
        if (hasSearchOrBuyingWord && hasProductWord) {
            return true;
        }

        /*
         * Case 2: "áo màu vàng", "giày size 42", "quần nam dưới 500k"
         * Không có từ "tìm", nhưng đây vẫn là mô tả sản phẩm cần tìm.
         * Chỉ coi là search nếu không có từ tham chiếu như "áo này", "mẫu đó".
         */
        return hasProductWord && hasFilterWord && !hasReferenceWord(normalized);
    }

    private boolean asksOnlyFactWithoutProductIntent(String normalized, Set<String> tokens) {
        boolean hasProductWord = hasProductWord(normalized, tokens);

        boolean hasSearchOrBuyingWord = containsAny(tokens,
                "tim", "kiem", "mua", "can", "muon", "goi", "y", "tu", "van", "chon");

        return !hasSearchOrBuyingWord && !hasProductWord;
    }

    private boolean hasProductWord(String normalized, Set<String> tokens) {
        return containsAny(tokens,
                "ao", "quan", "giay", "dep", "balo", "tui", "mu", "tat", "phu", "kien",
                "shirt", "tee", "pants", "shoes", "sneaker", "sneakers", "hoodie", "jacket")
                || normalized.contains("the thao")
                || normalized.contains("san pham")
                || normalized.contains("do tap")
                || normalized.contains("do bong da")
                || normalized.contains("quan ao");
    }

    private boolean hasReferenceWord(String normalized) {
        return normalized.contains("ao nay")
                || normalized.contains("quan nay")
                || normalized.contains("giay nay")
                || normalized.contains("doi nay")
                || normalized.contains("mau nay")
                || normalized.contains("cai nay")
                || normalized.contains("san pham nay")
                || normalized.contains("ao do")
                || normalized.contains("quan do")
                || normalized.contains("giay do")
                || normalized.contains("doi do")
                || normalized.contains("mau do")
                || normalized.contains("cai do")
                || normalized.contains("san pham do")
                || normalized.contains("vua roi")
                || normalized.contains("luc nay")
                || normalized.contains("dau tien")
                || normalized.contains("thu hai")
                || normalized.contains("thu ba")
                || normalized.contains("mau 1")
                || normalized.contains("mau 2")
                || normalized.contains("mau 3")
                || normalized.contains("san pham 1")
                || normalized.contains("san pham 2")
                || normalized.contains("san pham 3");
    }

    private boolean hasColorFilter(String normalized, Set<String> tokens) {
        return normalized.contains("mau")
                || containsAny(tokens, "den", "trang", "do", "xanh", "vang", "hong", "tim", "xam", "nau", "cam");
    }

    private boolean hasSizeFilter(String normalized) {
        return normalized.contains("size")
                || normalized.contains("sz")
                || normalized.contains("kich co")
                || normalized.contains("kich thuoc")
                || Pattern.compile("\\b(3[5-9]|4[0-9]|5[0-2]|xs|s|m|l|xl|xxl|xxxl)\\b")
                .matcher(normalized)
                .find();
    }

    private boolean hasPriceFilter(String normalized) {
        return normalized.contains("duoi")
                || normalized.contains("tren")
                || normalized.contains("tam gia")
                || normalized.contains("ngan sach")
                || normalized.contains("gia")
                || normalized.contains("trieu")
                || normalized.contains("k")
                || normalized.contains("vnd")
                || normalized.contains("dong");
    }

    private boolean hasGenderFilter(Set<String> tokens) {
        return containsAny(tokens, "nam", "nu", "unisex", "tre", "em", "be");
    }

    private AiSuggestedProduct selectSuggestedProduct(String normalized, List<AiSuggestedProduct> suggestions) {
        Integer rank = detectRank(normalized);

        if (rank != null) {
            return suggestions.stream()
                    .filter(item -> item.getRankOrder() != null && item.getRankOrder().equals(rank))
                    .findFirst()
                    .orElse(suggestions.get(0));
        }

        return suggestions.get(0);
    }

    private Integer detectRank(String normalized) {
        if (normalized.contains("dau tien") || normalized.contains("so 1") || normalized.contains("thu 1") || normalized.contains("mau 1")) {
            return 1;
        }

        if (normalized.contains("thu hai") || normalized.contains("so 2") || normalized.contains("thu 2") || normalized.contains("mau 2")) {
            return 2;
        }

        if (normalized.contains("thu ba") || normalized.contains("so 3") || normalized.contains("thu 3") || normalized.contains("mau 3")) {
            return 3;
        }

        Matcher matcher = Pattern.compile("\\b(?:mau|san pham|doi|ao|quan)\\s*(\\d+)\\b").matcher(normalized);
        if (matcher.find()) {
            try {
                int value = Integer.parseInt(matcher.group(1));
                if (value >= 1 && value <= 5) {
                    return value;
                }
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }

    private String buildFactReply(String normalized,
                                  ProductAiDocument document,
                                  boolean asksSize,
                                  boolean asksColor,
                                  boolean asksPrice,
                                  boolean asksStock,
                                  boolean asksPromotion) {
        StringBuilder reply = new StringBuilder();
        String name = AiTextNormalizer.hasText(document.getProductName()) ? document.getProductName() : "sản phẩm này";

        reply.append("Với mẫu ").append(name).append(", ");

        if (asksSize) {
            String requestedSize = detectRequestedSize(normalized);

            if (AiTextNormalizer.hasText(requestedSize)) {
                if (containsValue(document.getSizes(), requestedSize)) {
                    reply.append("hiện có size ").append(requestedSize).append(". ");
                } else if (AiTextNormalizer.hasText(document.getSizes())) {
                    reply.append("mình chưa thấy size ").append(requestedSize)
                            .append(" trong dữ liệu hiện tại. Các size đang có là: ")
                            .append(document.getSizes()).append(". ");
                } else {
                    reply.append("mình chưa có dữ liệu size cụ thể cho mẫu này. ");
                }
            } else if (AiTextNormalizer.hasText(document.getSizes())) {
                reply.append("hiện có các size: ").append(document.getSizes()).append(". ");
            } else {
                reply.append("mình chưa có dữ liệu size cụ thể cho mẫu này. ");
            }
        }

        if (asksColor) {
            String requestedColor = detectRequestedColor(normalized);

            if (AiTextNormalizer.hasText(requestedColor)) {
                if (containsValue(document.getColors(), requestedColor)) {
                    reply.append("Mẫu này có màu ").append(requestedColor).append(". ");
                } else if (AiTextNormalizer.hasText(document.getColors())) {
                    reply.append("mình chưa thấy màu ").append(requestedColor)
                            .append(" trong dữ liệu hiện tại. Các màu đang có là: ")
                            .append(document.getColors()).append(". ");
                } else {
                    reply.append("mình chưa có dữ liệu màu cụ thể cho mẫu này. ");
                }
            } else if (AiTextNormalizer.hasText(document.getColors())) {
                reply.append("màu đang có là: ").append(document.getColors()).append(". ");
            } else {
                reply.append("mình chưa có dữ liệu màu cụ thể cho mẫu này. ");
            }
        }

        if (asksPrice) {
            reply.append("giá hiện tại là ").append(buildPriceLabel(document)).append(". ");
        }

        if (asksStock) {
            if (Boolean.TRUE.equals(document.getInStock())) {
                reply.append("Sản phẩm đang còn hàng. ");
            } else {
                reply.append("Dữ liệu hiện tại cho thấy sản phẩm có thể đã hết hàng hoặc chưa cập nhật tồn kho. ");
            }
        }

        if (asksPromotion) {
            if (Boolean.TRUE.equals(document.getOnPromotion())) {
                reply.append("Mẫu này đang có khuyến mãi");
                if (document.getMaxDiscountPercent() != null && document.getMaxDiscountPercent() > 0) {
                    reply.append(" tối đa ").append(document.getMaxDiscountPercent()).append("%");
                }
                reply.append(". ");
            } else {
                reply.append("Mẫu này hiện chưa có thông tin khuyến mãi. ");
            }
        }

        reply.append("Bạn muốn mình kiểm tra tiếp màu, size cụ thể hay so sánh với mẫu khác không?");
        return reply.toString().replaceAll("\\s+", " ").trim();
    }

    private boolean asksSize(String normalized) {
        return normalized.contains("size")
                || normalized.contains("sz")
                || normalized.contains("kich co")
                || normalized.contains("kich thuoc")
                || normalized.contains("bao nhieu size")
                || normalized.contains("bao nhieu sz")
                || normalized.contains("con size")
                || normalized.contains("size nao")
                || normalized.contains("co size");
    }

    private boolean asksColor(String normalized) {
        return normalized.contains("mau gi")
                || normalized.contains("mau nao")
                || normalized.contains("nhung mau")
                || normalized.contains("co mau")
                || normalized.contains("mau do")
                || normalized.contains("mau den")
                || normalized.contains("mau trang")
                || normalized.contains("mau xanh")
                || normalized.contains("mau vang")
                || normalized.contains("mau hong")
                || normalized.contains("mau xam")
                || normalized.contains("color")
                || normalized.contains("colour");
    }

    private boolean asksPrice(String normalized) {
        return normalized.contains("gia bao nhieu")
                || normalized.contains("bao nhieu tien")
                || normalized.contains("may tien")
                || normalized.contains("gia cua")
                || normalized.contains("gia tien")
                || normalized.matches(".*\\bgia\\b.*");
    }

    private boolean asksStock(String normalized) {
        return normalized.contains("con hang")
                || normalized.contains("het hang")
                || normalized.contains("ton kho")
                || normalized.contains("co san")
                || normalized.contains("con khong");
    }

    private boolean asksPromotion(String normalized) {
        return normalized.contains("khuyen mai")
                || normalized.contains("giam gia")
                || normalized.contains("sale")
                || normalized.contains("discount");
    }

    private String detectRequestedSize(String normalized) {
        Matcher matcher = Pattern.compile("\\b(?:size|sz)\\s*(\\d{2}|xs|s|m|l|xl|xxl|xxxl)\\b").matcher(normalized);
        if (matcher.find()) {
            return matcher.group(1).toUpperCase(Locale.ROOT);
        }

        matcher = Pattern.compile("\\b(3[5-9]|4[0-9]|5[0-2]|xs|s|m|l|xl|xxl|xxxl)\\b").matcher(normalized);
        if (matcher.find()) {
            return matcher.group(1).toUpperCase(Locale.ROOT);
        }

        return null;
    }

    private String detectRequestedColor(String normalized) {
        Set<String> tokens = AiTextNormalizer.tokens(normalized);

        if (tokens.contains("den")) {
            return "đen";
        }
        if (tokens.contains("trang")) {
            return "trắng";
        }
        if (tokens.contains("do")) {
            return "đỏ";
        }
        if (tokens.contains("xanh")) {
            return "xanh";
        }
        if (tokens.contains("vang")) {
            return "vàng";
        }
        if (tokens.contains("hong")) {
            return "hồng";
        }
        if (tokens.contains("tim")) {
            return "tím";
        }
        if (tokens.contains("xam")) {
            return "xám";
        }
        if (tokens.contains("nau")) {
            return "nâu";
        }
        if (tokens.contains("cam")) {
            return "cam";
        }

        return null;
    }

    private boolean containsValue(String rawValues, String requestedValue) {
        if (!AiTextNormalizer.hasText(rawValues) || !AiTextNormalizer.hasText(requestedValue)) {
            return false;
        }

        String normalizedValues = AiTextNormalizer.normalize(rawValues);
        String normalizedRequested = AiTextNormalizer.normalize(requestedValue);

        return normalizedValues.contains(normalizedRequested);
    }

    private boolean containsAny(Set<String> tokens, String... values) {
        if (tokens == null || tokens.isEmpty() || values == null) {
            return false;
        }

        for (String value : values) {
            if (tokens.contains(value)) {
                return true;
            }
        }

        return false;
    }

    private String buildPriceLabel(ProductAiDocument document) {
        if (AiTextNormalizer.hasText(document.getPriceLabel())) {
            return document.getPriceLabel();
        }

        if (document.getMinPrice() != null) {
            NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
            return formatter.format(document.getMinPrice()) + "đ";
        }

        return "chưa có dữ liệu giá";
    }

    private AiProductSuggestionResponse toSuggestion(ProductAiDocument document) {
        return new AiProductSuggestionResponse(
                document.getProductId(),
                document.getProductName(),
                document.getThumbnailUrl(),
                document.getProductUrl(),
                buildPriceLabel(document),
                "Sản phẩm đang được hỏi trong hội thoại",
                document.getSizes(),
                document.getColors()
        );
    }
}
