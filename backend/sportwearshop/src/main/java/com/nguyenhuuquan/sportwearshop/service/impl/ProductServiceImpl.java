package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductPageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductSearchRequest;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.repository.ProductImageRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.service.ProductService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.specification.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final PromotionPricingService promotionPricingService;

    public ProductServiceImpl(ProductRepository productRepository,
                              ProductVariantRepository productVariantRepository,
                              ProductImageRepository productImageRepository,
                              PromotionPricingService promotionPricingService) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productImageRepository = productImageRepository;
        this.promotionPricingService = promotionPricingService;
    }

    @Override
    public ProductPageResponse getAllProducts(ProductSearchRequest request) {
        Specification<Product> specification = ProductSpecification.isActive()
                .and(ProductSpecification.hasKeyword(request.getKeyword()))
                .and(ProductSpecification.hasCategoryId(request.getCategoryId()))
                .and(ProductSpecification.hasBrandId(request.getBrandId()))
                .and(ProductSpecification.hasSportId(request.getSportId()))
                .and(ProductSpecification.hasGender(request.getGender()))
                .and(ProductSpecification.hasPriceBetween(request.getMinPrice(), request.getMaxPrice()));

        if (isPriceSort(request.getSort()) || Boolean.TRUE.equals(request.getPromotionOnly())) {
            return getAllProductsWithComputedPriceSort(request, specification);
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

    private ProductPageResponse getAllProductsWithComputedPriceSort(ProductSearchRequest request,
                                                                    Specification<Product> specification) {
        Sort baseSort = isPriceSort(request.getSort()) ? Sort.by(Sort.Direction.DESC, "id") : buildSort(request.getSort());
        List<Product> products = productRepository.findAll(specification, baseSort);
        Map<Long, List<ProductVariant>> variantsByProductId = loadVariantsByProductId(products);

        Comparator<ProductResponse> comparator = Comparator.comparing(
                this::resolveSortablePrice,
                Comparator.nullsLast(Double::compareTo)
        );

        if ("priceDesc".equalsIgnoreCase(request.getSort())) {
            comparator = comparator.reversed();
        }

        List<ProductResponse> allResponses = products.stream()
                .map(product -> mapToProductResponse(
                        product,
                        variantsByProductId.getOrDefault(product.getId(), Collections.emptyList())
                ))
                .filter(response -> !Boolean.TRUE.equals(request.getPromotionOnly()) || Boolean.TRUE.equals(response.getOnPromotion()))
                .collect(Collectors.toList());

        if (isPriceSort(request.getSort())) {
            allResponses = allResponses.stream().sorted(comparator).collect(Collectors.toList());
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
            case "newest" -> Sort.by(Sort.Direction.DESC, "id");
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
