package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductAiDocument;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.repository.ProductAiDocumentRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.service.ProductAiIndexService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.util.AiTextNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductAiIndexServiceImpl implements ProductAiIndexService {

    private static final Logger log = LoggerFactory.getLogger(ProductAiIndexServiceImpl.class);

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductAiDocumentRepository productAiDocumentRepository;
    private final PromotionPricingService promotionPricingService;

    public ProductAiIndexServiceImpl(ProductRepository productRepository,
                                     ProductVariantRepository productVariantRepository,
                                     ProductAiDocumentRepository productAiDocumentRepository,
                                     PromotionPricingService promotionPricingService) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productAiDocumentRepository = productAiDocumentRepository;
        this.promotionPricingService = promotionPricingService;
    }

    @Override
    @Transactional
    public int rebuildIndex() {
        List<Product> products = productRepository.findAll();

        List<Long> productIds = products.stream()
                .map(Product::getId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, List<ProductVariant>> variantsByProductId = productIds.isEmpty()
                ? Collections.emptyMap()
                : productVariantRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(variant -> variant.getProduct().getId()));

        productAiDocumentRepository.deleteAllInBatch();

        List<ProductAiDocument> documents = products.stream()
                .map(product -> buildDocument(product, variantsByProductId.getOrDefault(product.getId(), List.of())))
                .toList();

        productAiDocumentRepository.saveAll(documents);
        return documents.size();
    }

    private ProductAiDocument buildDocument(Product product, List<ProductVariant> variants) {
        PriceSummary priceSummary = summarizePrice(variants);

        Set<String> sizes = variants.stream()
                .map(ProductVariant::getSize)
                .filter(AiTextNormalizer::hasText)
                .map(String::trim)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<String> colors = variants.stream()
                .map(ProductVariant::getColor)
                .filter(AiTextNormalizer::hasText)
                .map(String::trim)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String productName = AiTextNormalizer.safe(product.getName());
        String productSlug = AiTextNormalizer.safe(product.getSlug());
        String brandName = product.getBrand() != null ? AiTextNormalizer.safe(product.getBrand().getName()) : "";
        String brandSlug = product.getBrand() != null ? AiTextNormalizer.safe(product.getBrand().getSlug()) : "";
        String categoryName = product.getCategory() != null ? AiTextNormalizer.safe(product.getCategory().getName()) : "";
        String categorySlug = product.getCategory() != null ? AiTextNormalizer.safe(product.getCategory().getSlug()) : "";
        String sportName = product.getSport() != null ? AiTextNormalizer.safe(product.getSport().getName()) : "";
        String sportSlug = product.getSport() != null ? AiTextNormalizer.safe(product.getSport().getSlug()) : "";
        String material = AiTextNormalizer.safe(product.getMaterial());
        String description = AiTextNormalizer.safe(product.getDescription());
        String categoryGroup = detectCategoryGroup(productName + " " + categoryName + " " + categorySlug);

        Set<String> features = detectFeatures(productName, categoryGroup, sportName, sportSlug, material, description);
        Set<String> useCases = detectUseCases(productName, categoryGroup, sportName, sportSlug, description);
        Set<String> aiTags = buildAiTags(product, categoryGroup, features, useCases, sizes, colors);

        String searchText = buildSearchText(
                productName,
                brandName,
                categoryName,
                sportName,
                product.getGender() != null ? product.getGender().name() : "",
                material,
                description,
                features,
                useCases,
                aiTags,
                sizes,
                colors,
                priceSummary.priceLabel()
        );

        ProductAiDocument document = new ProductAiDocument();
        document.setProductId(product.getId());
        document.setProductName(productName);
        document.setProductSlug(productSlug);
        document.setProductUrl("/products/" + product.getId());
        document.setThumbnailUrl(normalizeThumbnailUrl(product.getThumbnailUrl()));
        document.setBrandName(brandName);
        document.setBrandSlug(brandSlug);
        document.setCategoryName(categoryName);
        document.setCategorySlug(categorySlug);
        document.setCategoryGroup(categoryGroup);
        document.setSportName(sportName);
        document.setSportSlug(sportSlug);
        document.setGender(product.getGender());
        document.setMaterial(material);
        document.setMinPrice(priceSummary.minFinalPrice());
        document.setMaxPrice(priceSummary.maxFinalPrice());
        document.setMinOriginalPrice(priceSummary.minOriginalPrice());
        document.setPriceLabel(priceSummary.priceLabel());
        document.setInStock(priceSummary.inStock());
        document.setOnPromotion(priceSummary.onPromotion());
        document.setMaxDiscountPercent(priceSummary.maxDiscountPercent());
        document.setSizes(String.join(", ", sizes));
        document.setColors(String.join(", ", colors));
        document.setDescription(description);
        document.setFeatures(String.join(", ", features));
        document.setUseCases(String.join(", ", useCases));
        document.setAiTags(String.join(", ", aiTags));
        document.setSearchText(searchText);
        document.setSearchableText(AiTextNormalizer.normalize(searchText));
        document.setProductActive(Boolean.TRUE.equals(product.getIsActive()));
        document.setLastIndexedAt(LocalDateTime.now());

        return document;
    }

    private PriceSummary summarizePrice(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return new PriceSummary(null, null, null, "Liên hệ", false, false, 0);
        }

        List<VariantPrice> prices = variants.stream()
                .map(this::toVariantPrice)
                .filter(Objects::nonNull)
                .toList();

        Double minFinalPrice = prices.stream()
                .map(VariantPrice::finalPrice)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(null);

        Double maxFinalPrice = prices.stream()
                .map(VariantPrice::finalPrice)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);

        Double minOriginalPrice = prices.stream()
                .map(VariantPrice::originalPrice)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(null);

        boolean inStock = variants.stream()
                .anyMatch(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() > 0);

        boolean onPromotion = prices.stream().anyMatch(VariantPrice::onPromotion);

        int maxDiscountPercent = prices.stream()
                .map(VariantPrice::discountPercent)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);

        return new PriceSummary(
                minFinalPrice,
                maxFinalPrice,
                minOriginalPrice,
                buildPriceLabel(minFinalPrice, minOriginalPrice, onPromotion, maxDiscountPercent),
                inStock,
                onPromotion,
                maxDiscountPercent
        );
    }

    private VariantPrice toVariantPrice(ProductVariant variant) {
        if (variant == null) {
            return null;
        }

        try {
            VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);
            if (pricing == null) {
                return new VariantPrice(variant.getPrice(), variant.getPrice(), false, 0);
            }

            return new VariantPrice(
                    pricing.getOriginalPrice() != null ? pricing.getOriginalPrice() : variant.getPrice(),
                    pricing.getFinalPrice() != null ? pricing.getFinalPrice() : variant.getPrice(),
                    Boolean.TRUE.equals(pricing.getOnPromotion()),
                    pricing.getDiscountPercent() != null ? pricing.getDiscountPercent() : 0
            );
        } catch (Exception exception) {
            log.warn("Cannot calculate promotion price for variant {}", variant.getId(), exception);
            return new VariantPrice(variant.getPrice(), variant.getPrice(), false, 0);
        }
    }

    private Set<String> detectFeatures(String productName,
                                       String categoryGroup,
                                       String sportName,
                                       String sportSlug,
                                       String material,
                                       String description) {
        String text = AiTextNormalizer.normalize(String.join(" ", productName, categoryGroup, sportName, sportSlug, material, description));
        Set<String> features = new LinkedHashSet<>();

        if ("shoes".equals(categoryGroup)) {
            features.addAll(List.of("êm chân", "đế bám", "hỗ trợ vận động", "đi bộ nhiều"));
        }

        if ("apparel".equals(categoryGroup)) {
            features.addAll(List.of("thoải mái khi vận động", "dễ phối đồ", "phù hợp tập luyện"));
        }

        if (text.contains("running") || text.contains("chay bo") || text.contains("run")) {
            features.addAll(List.of("nhẹ", "êm chân", "thoáng khí", "phù hợp chạy bộ", "phù hợp đi bộ"));
        }

        if (text.contains("gym") || text.contains("fitness") || text.contains("training") || text.contains("the hinh")) {
            features.addAll(List.of("co giãn", "thoáng khí", "phù hợp tập gym", "không bí khi tập"));
        }

        if (text.contains("yoga")) {
            features.addAll(List.of("co giãn", "mềm mại", "thoải mái", "phù hợp yoga"));
        }

        if (text.contains("bong da") || text.contains("football") || text.contains("soccer")) {
            features.addAll(List.of("bám sân", "hỗ trợ di chuyển", "phù hợp đá bóng"));
        }

        if (text.contains("polyester")) {
            features.addAll(List.of("nhẹ", "nhanh khô", "thoáng khí", "ít nhăn"));
        }

        if (text.contains("mesh") || text.contains("luoi")) {
            features.addAll(List.of("thoáng khí", "mát", "nhẹ"));
        }

        if (text.contains("spandex") || text.contains("elastane") || text.contains("co gian")) {
            features.addAll(List.of("co giãn", "ôm vừa", "linh hoạt khi vận động"));
        }

        if (text.contains("cotton")) {
            features.addAll(List.of("mềm", "thoải mái", "thấm hút"));
        }

        if (text.contains("leather") || text.contains("da ")) {
            features.addAll(List.of("bền", "giữ form tốt"));
        }

        return features;
    }

    private Set<String> detectUseCases(String productName,
                                       String categoryGroup,
                                       String sportName,
                                       String sportSlug,
                                       String description) {
        String text = AiTextNormalizer.normalize(String.join(" ", productName, categoryGroup, sportName, sportSlug, description));
        Set<String> useCases = new LinkedHashSet<>();

        if ("shoes".equals(categoryGroup)) {
            useCases.addAll(List.of("đi bộ", "đi chơi", "tập luyện", "sử dụng hằng ngày"));
        }

        if ("apparel".equals(categoryGroup)) {
            useCases.addAll(List.of("tập luyện", "mặc hằng ngày", "đi chơi thể thao"));
        }

        if ("accessories".equals(categoryGroup)) {
            useCases.addAll(List.of("phụ kiện thể thao", "mang theo khi tập luyện"));
        }

        if (text.contains("running") || text.contains("chay bo") || text.contains("run")) {
            useCases.addAll(List.of("chạy bộ", "running", "đi bộ nhiều", "tập cardio"));
        }

        if (text.contains("gym") || text.contains("fitness") || text.contains("training")) {
            useCases.addAll(List.of("tập gym", "fitness", "training", "tập thể hình"));
        }

        if (text.contains("yoga")) {
            useCases.addAll(List.of("yoga", "pilates", "tập nhẹ"));
        }

        if (text.contains("bong da") || text.contains("football") || text.contains("soccer")) {
            useCases.addAll(List.of("đá bóng", "bóng đá", "sân cỏ"));
        }

        return useCases;
    }

    private Set<String> buildAiTags(Product product,
                                    String categoryGroup,
                                    Set<String> features,
                                    Set<String> useCases,
                                    Set<String> sizes,
                                    Set<String> colors) {
        Set<String> tags = new LinkedHashSet<>();

        if (AiTextNormalizer.hasText(categoryGroup)) {
            tags.add(categoryGroup);
        }

        if (product.getGender() != null) {
            tags.add(product.getGender().name());
        }

        if (product.getBrand() != null) {
            tags.add(product.getBrand().getName());
            tags.add(product.getBrand().getSlug());
        }

        if (product.getCategory() != null) {
            tags.add(product.getCategory().getName());
            tags.add(product.getCategory().getSlug());
        }

        if (product.getSport() != null) {
            tags.add(product.getSport().getName());
            tags.add(product.getSport().getSlug());
        }

        tags.addAll(features);
        tags.addAll(useCases);
        tags.addAll(sizes);
        tags.addAll(colors);

        return tags.stream()
                .filter(AiTextNormalizer::hasText)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String buildSearchText(String productName,
                                   String brandName,
                                   String categoryName,
                                   String sportName,
                                   String gender,
                                   String material,
                                   String description,
                                   Set<String> features,
                                   Set<String> useCases,
                                   Set<String> aiTags,
                                   Set<String> sizes,
                                   Set<String> colors,
                                   String priceLabel) {
        return """
                Sản phẩm: %s.
                Thương hiệu: %s.
                Danh mục: %s.
                Môn thể thao: %s.
                Giới tính: %s.
                Chất liệu: %s.
                Mô tả: %s.
                Đặc điểm: %s.
                Phù hợp dùng cho: %s.
                Tags AI: %s.
                Size: %s.
                Màu: %s.
                Giá: %s.
                """.formatted(
                productName,
                brandName,
                categoryName,
                sportName,
                gender,
                material,
                description,
                String.join(", ", features),
                String.join(", ", useCases),
                String.join(", ", aiTags),
                String.join(", ", sizes),
                String.join(", ", colors),
                priceLabel
        );
    }

    private String detectCategoryGroup(String value) {
        String text = AiTextNormalizer.normalize(value);
        Set<String> tokens = AiTextNormalizer.tokens(text);

        if (AiTextNormalizer.containsAny(tokens, "giay", "dep", "shoe", "shoes", "sneaker", "sneakers")) {
            return "shoes";
        }

        if (AiTextNormalizer.containsAny(tokens, "ao", "quan", "shirt", "tee", "hoodie", "jacket", "short", "shorts", "pants")
                || text.contains("quan ao")
                || text.contains("do tap")
                || text.contains("do the thao")) {
            return "apparel";
        }

        if (text.contains("phu kien")
                || AiTextNormalizer.containsAny(tokens, "tui", "mu", "balo", "tat", "vo", "cap", "bag", "accessory", "accessories")) {
            return "accessories";
        }

        return null;
    }

    private String normalizeThumbnailUrl(String thumbnailUrl) {
        if (!AiTextNormalizer.hasText(thumbnailUrl)) {
            return null;
        }

        String value = thumbnailUrl.trim();

        if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/uploads/")) {
            return value;
        }

        if (value.startsWith("/")) {
            return "/uploads" + value;
        }

        return "/uploads/" + value;
    }

    private String buildPriceLabel(Double finalPrice, Double originalPrice, boolean onPromotion, int discountPercent) {
        if (finalPrice == null) {
            return "Liên hệ";
        }

        String finalLabel = formatMoney(finalPrice);

        if (onPromotion && originalPrice != null && originalPrice > finalPrice) {
            if (discountPercent > 0) {
                return finalLabel + " (giảm " + discountPercent + "% từ " + formatMoney(originalPrice) + ")";
            }

            return finalLabel + " (đang khuyến mãi từ " + formatMoney(originalPrice) + ")";
        }

        return finalLabel;
    }

    private String formatMoney(Double value) {
        if (value == null) {
            return "Liên hệ";
        }

        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
        return formatter.format(Math.round(value)) + "đ";
    }

    private record VariantPrice(
            Double originalPrice,
            Double finalPrice,
            boolean onPromotion,
            Integer discountPercent
    ) {
    }

    private record PriceSummary(
            Double minFinalPrice,
            Double maxFinalPrice,
            Double minOriginalPrice,
            String priceLabel,
            boolean inStock,
            boolean onPromotion,
            int maxDiscountPercent
    ) {
    }
}
