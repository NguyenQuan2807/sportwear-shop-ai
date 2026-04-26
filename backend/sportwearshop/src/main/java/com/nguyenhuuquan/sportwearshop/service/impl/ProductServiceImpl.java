package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionTargetType;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductPageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductSearchRequest;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.Brand;
import com.nguyenhuuquan.sportwearshop.entity.Category;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.PromotionTarget;
import com.nguyenhuuquan.sportwearshop.entity.Sport;
import com.nguyenhuuquan.sportwearshop.repository.BrandRepository;
import com.nguyenhuuquan.sportwearshop.repository.CategoryRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductImageRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.repository.PromotionTargetRepository;
import com.nguyenhuuquan.sportwearshop.repository.SportRepository;
import com.nguyenhuuquan.sportwearshop.service.ProductService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.specification.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final PromotionPricingService promotionPricingService;
    private final PromotionTargetRepository promotionTargetRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SportRepository sportRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              ProductVariantRepository productVariantRepository,
                              ProductImageRepository productImageRepository,
                              PromotionPricingService promotionPricingService,
                              PromotionTargetRepository promotionTargetRepository,
                              CategoryRepository categoryRepository,
                              BrandRepository brandRepository,
                              SportRepository sportRepository) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productImageRepository = productImageRepository;
        this.promotionPricingService = promotionPricingService;
        this.promotionTargetRepository = promotionTargetRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.sportRepository = sportRepository;
    }

    @Override
    public ProductPageResponse getAllProducts(ProductSearchRequest request) {
        normalizeSearchIntent(request);

        Specification<Product> specification = ProductSpecification.isActive()
                .and(ProductSpecification.hasKeyword(request.getKeyword()))
                .and(ProductSpecification.hasCategoryId(request.getCategoryId()))
                .and(ProductSpecification.hasCategoryIds(request.getCategoryIds()))
                .and(ProductSpecification.hasCategoryGroup(resolveCategoryGroup(request)))
                .and(ProductSpecification.hasBrandId(request.getBrandId()))
                .and(ProductSpecification.hasSportId(request.getSportId()))
                .and(ProductSpecification.hasGender(request.getGender()))
                .and(ProductSpecification.hasPriceBetween(request.getMinPrice(), request.getMaxPrice()));

        if (needsComputedCatalog(request)) {
            return getAllProductsWithComputedFilters(request, specification);
        }

        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<Product> productPage = productRepository.findAll(specification, pageable);
        List<Product> products = productPage.getContent();

        Map<Long, List<ProductVariant>> variantsByProductId = loadVariantsByProductId(products);

        List<ProductResponse> productResponses = products.stream()
                .map(product -> mapToProductResponse(
                        product,
                        variantsByProductId.getOrDefault(product.getId(), Collections.emptyList())
                ))
                .collect(Collectors.toList());

        ProductPageResponse response = new ProductPageResponse();
        response.setContent(productResponses);
        response.setPage(productPage.getNumber());
        response.setSize(productPage.getSize());
        response.setTotalElements(productPage.getTotalElements());
        response.setTotalPages(productPage.getTotalPages());
        response.setLast(productPage.isLast());

        return response;
    }

    private static final Set<String> SEARCH_STOP_WORDS = Set.of(
            "san", "pham", "sp", "hang", "mau", "loai", "cho", "cua", "va", "the", "thao",
            "size", "co", "color", "colour", "dang", "ban", "new", "moi", "ve"
    );

    /**
     * Chuyển câu tìm kiếm tự nhiên thành filter rõ ràng trước khi query database.
     * Ví dụ: "áo nike nam" -> category Áo + brand Nike + gender MALE, keyword còn lại rỗng.
     * Nhờ vậy tìm "áo nike" sẽ không còn ra "giày nike" chỉ vì cùng brand Nike.
     */
    private void normalizeSearchIntent(ProductSearchRequest request) {
        if (request == null || request.getKeyword() == null || request.getKeyword().isBlank()) {
            return;
        }

        String originalKeyword = request.getKeyword().trim();
        String normalizedKeyword = normalizeSearchIntentText(originalKeyword);
        List<SearchToken> tokens = splitSearchTokens(originalKeyword);
        Set<String> consumedTokens = new HashSet<>();

        detectPromotionIntent(request, normalizedKeyword, consumedTokens);
        detectGenderIntent(request, tokens, consumedTokens);
        detectCategoryIntent(request, normalizedKeyword, tokens, consumedTokens);
        detectBrandIntent(request, normalizedKeyword, consumedTokens);
        detectSportIntent(request, normalizedKeyword, consumedTokens);

        String remainingKeyword = tokens.stream()
                .filter(token -> !consumedTokens.contains(token.normalized()))
                .filter(token -> !SEARCH_STOP_WORDS.contains(token.normalized()))
                .map(SearchToken::original)
                .collect(Collectors.joining(" "))
                .trim();

        request.setKeyword(remainingKeyword.isBlank() ? null : remainingKeyword);
    }

    private void detectPromotionIntent(ProductSearchRequest request,
                                       String normalizedKeyword,
                                       Set<String> consumedTokens) {
        if (containsWholePhrase(normalizedKeyword, "sale")
                || containsWholePhrase(normalizedKeyword, "discount")
                || containsWholePhrase(normalizedKeyword, "giam gia")
                || containsWholePhrase(normalizedKeyword, "khuyen mai")) {
            request.setPromotionOnly(true);
            Collections.addAll(consumedTokens, "sale", "discount", "giam", "gia", "khuyen", "mai");
        }

        if ((request.getSort() == null || request.getSort().isBlank() || "newest".equalsIgnoreCase(request.getSort()))
                && (containsWholePhrase(normalizedKeyword, "giam gia nhieu")
                || containsWholePhrase(normalizedKeyword, "discount"))) {
            request.setSort("discountDesc");
        }
    }

    private void detectGenderIntent(ProductSearchRequest request,
                                    List<SearchToken> tokens,
                                    Set<String> consumedTokens) {
        if (request.getGender() != null) {
            return;
        }

        Set<String> normalizedTokens = tokens.stream()
                .map(SearchToken::normalized)
                .collect(Collectors.toSet());

        if (containsAny(normalizedTokens, "nam", "male", "men", "man")) {
            request.setGender(Gender.MALE);
            Collections.addAll(consumedTokens, "nam", "male", "men", "man");
            return;
        }

        if (containsAny(normalizedTokens, "nu", "female", "women", "woman")) {
            request.setGender(Gender.FEMALE);
            Collections.addAll(consumedTokens, "nu", "female", "women", "woman");
            return;
        }

        if (containsAny(normalizedTokens, "unisex", "uni")) {
            request.setGender(Gender.UNISEX);
            Collections.addAll(consumedTokens, "unisex", "uni");
        }
    }

    private void detectCategoryIntent(ProductSearchRequest request,
                                      String normalizedKeyword,
                                      List<SearchToken> tokens,
                                      Set<String> consumedTokens) {
        if (request.getCategoryId() != null
                || (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty())
                || (request.getCategoryGroup() != null && !request.getCategoryGroup().isBlank())) {
            return;
        }

        List<Category> categories = categoryRepository.findAll().stream()
                .filter(category -> Boolean.TRUE.equals(category.getIsActive()))
                .collect(Collectors.toList());

        List<Long> matchedCategoryIds = new ArrayList<>();

        if (containsWholePhrase(normalizedKeyword, "quan ao") || containsWholePhrase(normalizedKeyword, "ao quan")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "ao", "quan"));
            Collections.addAll(consumedTokens, "quan", "ao");
        } else if (hasWholeToken(tokens, "ao")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "ao"));
            consumedTokens.add("ao");
        } else if (hasWholeToken(tokens, "quan")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "quan"));
            consumedTokens.add("quan");
        } else if (hasWholeToken(tokens, "giay")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "giay"));
            consumedTokens.add("giay");
        } else if (containsWholePhrase(normalizedKeyword, "phu kien")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "phu kien", "phukien"));
            Collections.addAll(consumedTokens, "phu", "kien");
        } else if (containsAny(tokens.stream().map(SearchToken::normalized).collect(Collectors.toSet()), "tui", "mu", "balo", "tat")) {
            matchedCategoryIds.addAll(findCategoryIdsByAliases(categories, "phu kien", "phukien"));
        }

        if (!matchedCategoryIds.isEmpty()) {
            request.setCategoryIds(matchedCategoryIds.stream().distinct().collect(Collectors.toList()));
        }
    }

    private void detectBrandIntent(ProductSearchRequest request,
                                   String normalizedKeyword,
                                   Set<String> consumedTokens) {
        if (request.getBrandId() != null) {
            return;
        }

        Brand matchedBrand = brandRepository.findAll().stream()
                .filter(brand -> Boolean.TRUE.equals(brand.getIsActive()))
                .filter(brand -> containsEntityName(normalizedKeyword, brand.getName())
                        || containsEntityName(normalizedKeyword, brand.getSlug()))
                .max(Comparator.comparingInt(brand -> normalizeSearchIntentText(brand.getName()).length()))
                .orElse(null);

        if (matchedBrand != null) {
            request.setBrandId(matchedBrand.getId());
            consumeEntityTokens(matchedBrand.getName(), consumedTokens);
            consumeEntityTokens(matchedBrand.getSlug(), consumedTokens);
        }
    }

    private void detectSportIntent(ProductSearchRequest request,
                                   String normalizedKeyword,
                                   Set<String> consumedTokens) {
        if (request.getSportId() != null) {
            return;
        }

        Sport matchedSport = sportRepository.findAll().stream()
                .filter(sport -> Boolean.TRUE.equals(sport.getIsActive()))
                .filter(sport -> containsEntityName(normalizedKeyword, sport.getName())
                        || containsEntityName(normalizedKeyword, sport.getSlug()))
                .max(Comparator.comparingInt(sport -> normalizeSearchIntentText(sport.getName()).length()))
                .orElse(null);

        if (matchedSport != null) {
            request.setSportId(matchedSport.getId());
            consumeEntityTokens(matchedSport.getName(), consumedTokens);
            consumeEntityTokens(matchedSport.getSlug(), consumedTokens);
        }
    }

    private List<Long> findCategoryIdsByAliases(List<Category> categories, String... aliases) {
        Set<String> aliasSet = new LinkedHashSet<>();
        for (String alias : aliases) {
            aliasSet.add(normalizeSearchIntentText(alias));
        }

        return categories.stream()
                .filter(category -> {
                    String normalizedName = normalizeSearchIntentText(category.getName());
                    String normalizedSlug = normalizeSearchIntentText(category.getSlug());

                    return aliasSet.stream().anyMatch(alias ->
                            Objects.equals(normalizedName, alias)
                                    || normalizedName.startsWith(alias + " ")
                                    || Objects.equals(normalizedSlug, alias)
                                    || normalizedSlug.startsWith(alias + " ")
                    );
                })
                .map(Category::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private void consumeEntityTokens(String value, Set<String> consumedTokens) {
        splitNormalizedTokens(value).forEach(consumedTokens::add);
    }

    private boolean containsEntityName(String normalizedKeyword, String rawEntityName) {
        String normalizedEntityName = normalizeSearchIntentText(rawEntityName);
        return !normalizedEntityName.isBlank() && containsWholePhrase(normalizedKeyword, normalizedEntityName);
    }

    private boolean containsWholePhrase(String normalizedText, String normalizedPhrase) {
        if (normalizedText == null || normalizedPhrase == null || normalizedPhrase.isBlank()) {
            return false;
        }

        return (" " + normalizedText + " ").contains(" " + normalizedPhrase.trim() + " ");
    }

    private boolean hasWholeToken(List<SearchToken> tokens, String normalizedToken) {
        return tokens.stream().anyMatch(token -> Objects.equals(token.normalized(), normalizedToken));
    }

    private boolean containsAny(Set<String> values, String... expectedValues) {
        for (String expectedValue : expectedValues) {
            if (values.contains(expectedValue)) {
                return true;
            }
        }
        return false;
    }

    private List<SearchToken> splitSearchTokens(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        String[] originalParts = value.trim().split("[^\\p{L}\\p{N}]+");
        List<SearchToken> result = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (String originalPart : originalParts) {
            if (originalPart == null || originalPart.isBlank()) {
                continue;
            }

            String normalized = normalizeSearchIntentText(originalPart);
            if (normalized.isBlank() || !seen.add(normalized)) {
                continue;
            }

            result.add(new SearchToken(originalPart, normalized));
        }

        return result;
    }

    private List<String> splitNormalizedTokens(String value) {
        String normalized = normalizeSearchIntentText(value);
        if (normalized.isBlank()) {
            return List.of();
        }

        return List.of(normalized.split("\\s+"));
    }

    private String normalizeSearchIntentText(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    private record SearchToken(String original, String normalized) {
    }


    private String resolveCategoryGroup(ProductSearchRequest request) {
        if (request.getCategoryId() != null) {
            return null;
        }

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            return null;
        }

        return request.getCategoryGroup();
    }

    @Override
    public ProductDetailResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAscIdAsc(product.getId());

        ProductDetailResponse response = new ProductDetailResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setSportId(product.getSport().getId());
        response.setSportName(product.getSport().getName());
        response.setBrandName(product.getBrand().getName());
        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial());
        response.setThumbnailUrl(product.getThumbnailUrl());
        response.setIsActive(product.getIsActive());

        response.setVariants(
                variants.stream()
                        .map(this::mapToVariantResponse)
                        .collect(Collectors.toList())
        );
        response.setImages(
                images.stream()
                        .map(this::mapToImageResponse)
                        .collect(Collectors.toList())
        );

        return response;
    }

    private boolean needsComputedCatalog(ProductSearchRequest request) {
        return isPriceSort(request.getSort())
                || isDiscountSort(request.getSort())
                || Boolean.TRUE.equals(request.getPromotionOnly())
                || request.getPromotionId() != null;
    }

    private ProductPageResponse getAllProductsWithComputedFilters(ProductSearchRequest request,
                                                                  Specification<Product> specification) {
        Sort baseSort = isPriceSort(request.getSort()) || isDiscountSort(request.getSort())
                ? Sort.by(Sort.Direction.DESC, "id")
                : buildSort(request.getSort());

        List<Product> products = productRepository.findAll(specification, baseSort);
        Map<Long, List<ProductVariant>> variantsByProductId = loadVariantsByProductId(products);

        List<PromotionTarget> promotionTargets = request.getPromotionId() != null
                ? promotionTargetRepository.findByPromotionId(request.getPromotionId())
                : Collections.emptyList();

        List<ProductResponse> allResponses = products.stream()
                .filter(product -> request.getPromotionId() == null || matchesPromotionTargets(
                        product,
                        variantsByProductId.getOrDefault(product.getId(), Collections.emptyList()),
                        promotionTargets
                ))
                .map(product -> mapToProductResponse(
                        product,
                        variantsByProductId.getOrDefault(product.getId(), Collections.emptyList())
                ))
                .filter(response -> !Boolean.TRUE.equals(request.getPromotionOnly()) || Boolean.TRUE.equals(response.getOnPromotion()))
                .collect(Collectors.toList());

        if (isPriceSort(request.getSort())) {
            Comparator<ProductResponse> comparator = Comparator.comparing(
                    this::resolveSortablePrice,
                    Comparator.nullsLast(Double::compareTo)
            );

            if ("priceDesc".equalsIgnoreCase(request.getSort())) {
                comparator = comparator.reversed();
            }

            allResponses = allResponses.stream().sorted(comparator).collect(Collectors.toList());
        }

        if (isDiscountSort(request.getSort())) {
            allResponses = allResponses.stream()
                    .sorted(Comparator.comparing(
                            ProductResponse::getMaxDiscountPercent,
                            Comparator.nullsLast(Integer::compareTo)
                    ).reversed())
                    .collect(Collectors.toList());
        }

        int totalElements = allResponses.size();
        int fromIndex = Math.min(request.getPage() * request.getSize(), totalElements);
        int toIndex = Math.min(fromIndex + request.getSize(), totalElements);
        List<ProductResponse> pagedContent = allResponses.subList(fromIndex, toIndex);

        ProductPageResponse response = new ProductPageResponse();
        response.setContent(pagedContent);
        response.setPage(request.getPage());
        response.setSize(request.getSize());
        response.setTotalElements(totalElements);
        response.setTotalPages((int) Math.ceil((double) totalElements / request.getSize()));
        response.setLast(toIndex >= totalElements);
        return response;
    }

    private boolean matchesPromotionTargets(Product product,
                                            List<ProductVariant> variants,
                                            List<PromotionTarget> promotionTargets) {
        if (promotionTargets == null || promotionTargets.isEmpty()) {
            return false;
        }

        Set<Long> variantIds = variants.stream()
                .map(ProductVariant::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (PromotionTarget target : promotionTargets) {
            PromotionTargetType type = target.getTargetType();
            Long targetId = target.getTargetId();

            if (type == PromotionTargetType.PRODUCT && Objects.equals(targetId, product.getId())) {
                return true;
            }

            if (type == PromotionTargetType.PRODUCT_VARIANT && variantIds.contains(targetId)) {
                return true;
            }

            if (type == PromotionTargetType.CATEGORY
                    && product.getCategory() != null
                    && Objects.equals(targetId, product.getCategory().getId())) {
                return true;
            }

            if (type == PromotionTargetType.BRAND
                    && product.getBrand() != null
                    && Objects.equals(targetId, product.getBrand().getId())) {
                return true;
            }

            if (type == PromotionTargetType.SPORT
                    && product.getSport() != null
                    && Objects.equals(targetId, product.getSport().getId())) {
                return true;
            }
        }

        return false;
    }

    private Double resolveSortablePrice(ProductResponse productResponse) {
        if (productResponse == null) {
            return null;
        }

        if (productResponse.getSaleMinPrice() != null) {
            return productResponse.getSaleMinPrice();
        }

        return productResponse.getMinPrice();
    }

    private boolean isPriceSort(String sortValue) {
        return "priceAsc".equalsIgnoreCase(sortValue) || "priceDesc".equalsIgnoreCase(sortValue);
    }

    private boolean isDiscountSort(String sortValue) {
        return "discountDesc".equalsIgnoreCase(sortValue);
    }

    private Map<Long, List<ProductVariant>> loadVariantsByProductId(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> productIds = products.stream()
                .map(Product::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return productVariantRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(variant -> variant.getProduct().getId()));
    }

    private ProductResponse mapToProductResponse(Product product, List<ProductVariant> variants) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setCategoryName(product.getCategory().getName());
        response.setBrandName(product.getBrand().getName());
        response.setSportName(product.getSport().getName());
        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial());
        response.setThumbnailUrl(normalizeThumbnailUrl(product.getThumbnailUrl()));
        response.setIsActive(product.getIsActive());

        List<Double> originalPrices = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<VariantPricingResponse> pricingList = variants.stream()
                .map(promotionPricingService::calculateVariantPricing)
                .collect(Collectors.toList());

        List<Double> salePrices = pricingList.stream()
                .map(VariantPricingResponse::getFinalPrice)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        boolean inStock = variants.stream()
                .anyMatch(variant -> variant.getStockQuantity() != null && variant.getStockQuantity() > 0);

        boolean onPromotion = pricingList.stream()
                .anyMatch(pricing -> Boolean.TRUE.equals(pricing.getOnPromotion()));

        boolean flashSale = pricingList.stream()
                .anyMatch(pricing -> Boolean.TRUE.equals(pricing.getFlashSale()));

        int maxDiscountPercent = pricingList.stream()
                .map(VariantPricingResponse::getDiscountPercent)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);

        int colorCount = (int) variants.stream()
                .map(ProductVariant::getColor)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(color -> !color.isBlank())
                .distinct()
                .count();

        Double originalMinPrice = originalPrices.stream().min(Double::compareTo).orElse(null);
        Double originalMaxPrice = originalPrices.stream().max(Double::compareTo).orElse(null);
        Double saleMinPrice = salePrices.stream().min(Double::compareTo).orElse(null);
        Double saleMaxPrice = salePrices.stream().max(Double::compareTo).orElse(null);

        response.setMinPrice(saleMinPrice);
        response.setMaxPrice(saleMaxPrice);
        response.setInStock(inStock);
        response.setColorCount(colorCount);

        response.setOriginalMinPrice(originalMinPrice);
        response.setOriginalMaxPrice(originalMaxPrice);
        response.setSaleMinPrice(saleMinPrice);
        response.setSaleMaxPrice(saleMaxPrice);
        response.setMaxDiscountPercent(maxDiscountPercent);
        response.setOnPromotion(onPromotion);
        response.setFlashSale(flashSale);

        return response;
    }

    private ProductVariantResponse mapToVariantResponse(ProductVariant variant) {
        VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);

        ProductVariantResponse response = new ProductVariantResponse();
        response.setId(variant.getId());
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());

        response.setPrice(pricing.getFinalPrice());
        response.setOriginalPrice(pricing.getOriginalPrice());
        response.setFinalPrice(pricing.getFinalPrice());
        response.setDiscountAmount(pricing.getDiscountAmount());
        response.setDiscountPercent(pricing.getDiscountPercent());
        response.setOnPromotion(pricing.getOnPromotion());
        response.setFlashSale(pricing.getFlashSale());
        response.setAppliedPromotion(pricing.getAppliedPromotion());

        response.setStockQuantity(variant.getStockQuantity());
        response.setSku(variant.getSku());
        return response;
    }

    private ProductImageResponse mapToImageResponse(ProductImage image) {
        ProductImageResponse response = new ProductImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setColor(image.getColor());
        response.setIsThumbnail(image.getIsThumbnail());
        response.setSortOrder(image.getSortOrder());
        return response;
    }

    private Sort buildSort(String sortValue) {
        if (sortValue == null || sortValue.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        return switch (sortValue) {
            case "newest", "popular" -> Sort.by(Sort.Direction.DESC, "id");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "id");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }

    private String normalizeThumbnailUrl(String thumbnailUrl) {
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            return null;
        }

        if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
            return thumbnailUrl;
        }

        if (thumbnailUrl.startsWith("/uploads/")) {
            return thumbnailUrl;
        }

        if (thumbnailUrl.startsWith("/")) {
            return "/uploads" + thumbnailUrl;
        }

        return "/uploads/" + thumbnailUrl;
    }
}
