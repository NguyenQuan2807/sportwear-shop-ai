package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductPageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductSearchRequest;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.repository.ProductImageRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.service.ProductService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.specification.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Specification<Product> specification = ProductSpecification.isActive();

        specification = specification.and(ProductSpecification.hasKeyword(request.getKeyword()));
        specification = specification.and(ProductSpecification.hasCategoryId(request.getCategoryId()));
        specification = specification.and(ProductSpecification.hasBrandId(request.getBrandId()));
        specification = specification.and(ProductSpecification.hasSportId(request.getSportId()));
        specification = specification.and(ProductSpecification.hasPriceBetween(request.getMinPrice(), request.getMaxPrice()));

        Page<Product> productPage = productRepository.findAll(specification, pageable);

        List<ProductResponse> productResponses = productPage.getContent()
                .stream()
                .map(this::mapToProductResponse)
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
        List<ProductImage> images = productImageRepository.findByProductId(product.getId());

        ProductDetailResponse response = new ProductDetailResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setCategoryName(product.getCategory().getName());
        response.setBrandName(product.getBrand().getName());
        response.setSportName(product.getSport().getName());
        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial());
        response.setThumbnailUrl(product.getThumbnailUrl());
        response.setIsActive(product.getIsActive());

        response.setVariants(variants.stream().map(this::mapToVariantResponse).collect(Collectors.toList()));
        response.setImages(images.stream().map(this::mapToImageResponse).collect(Collectors.toList()));

        return response;
    }

    private ProductResponse mapToProductResponse(Product product) {
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
        response.setThumbnailUrl(product.getThumbnailUrl());
        response.setIsActive(product.getIsActive());

        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());

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

        response.setMinPrice(salePrices.stream().min(Double::compareTo).orElse(null));
        response.setMaxPrice(salePrices.stream().max(Double::compareTo).orElse(null));
        response.setInStock(inStock);

        response.setOriginalMinPrice(originalPrices.stream().min(Double::compareTo).orElse(null));
        response.setOriginalMaxPrice(originalPrices.stream().max(Double::compareTo).orElse(null));
        response.setSaleMinPrice(salePrices.stream().min(Double::compareTo).orElse(null));
        response.setSaleMaxPrice(salePrices.stream().max(Double::compareTo).orElse(null));
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
        response.setIsThumbnail(image.getIsThumbnail());
        response.setSortOrder(image.getSortOrder());
        return response;
    }

    private Sort buildSort(String sortValue) {
        if (sortValue == null || sortValue.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        return switch (sortValue) {
            case "nameAsc" -> Sort.by(Sort.Direction.ASC, "name");
            case "nameDesc" -> Sort.by(Sort.Direction.DESC, "name");
            case "newest" -> Sort.by(Sort.Direction.DESC, "id");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "id");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }
}