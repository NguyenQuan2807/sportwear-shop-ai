package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.dto.wishlist.AddToWishlistRequest;
import com.nguyenhuuquan.sportwearshop.dto.wishlist.WishlistItemResponse;
import com.nguyenhuuquan.sportwearshop.dto.wishlist.WishlistResponse;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.entity.Wishlist;
import com.nguyenhuuquan.sportwearshop.entity.WishlistItem;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.repository.WishlistItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.WishlistRepository;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.service.WishlistService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final UserRepository userRepository;
    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionPricingService promotionPricingService;

    public WishlistServiceImpl(UserRepository userRepository,
                               WishlistRepository wishlistRepository,
                               WishlistItemRepository wishlistItemRepository,
                               ProductRepository productRepository,
                               ProductVariantRepository productVariantRepository,
                               PromotionPricingService promotionPricingService) {
        this.userRepository = userRepository;
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.promotionPricingService = promotionPricingService;
    }

    @Override
    public WishlistResponse getMyWishlist(String email) {
        User user = getUserByEmail(email);
        Wishlist wishlist = getOrCreateWishlist(user);
        return mapToWishlistResponse(wishlist);
    }

    @Override
    public WishlistResponse addToWishlist(String email, AddToWishlistRequest request) {
        User user = getUserByEmail(email);
        Wishlist wishlist = getOrCreateWishlist(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        wishlistItemRepository.findByWishlistAndProduct(wishlist, product)
                .orElseGet(() -> {
                    WishlistItem wishlistItem = new WishlistItem();
                    wishlistItem.setWishlist(wishlist);
                    wishlistItem.setProduct(product);
                    return wishlistItemRepository.save(wishlistItem);
                });

        return mapToWishlistResponse(wishlist);
    }

    @Override
    public WishlistResponse removeFromWishlist(String email, Long productId) {
        User user = getUserByEmail(email);
        Wishlist wishlist = getOrCreateWishlist(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        wishlistItemRepository.findByWishlistAndProduct(wishlist, product)
                .ifPresent(wishlistItemRepository::delete);

        return mapToWishlistResponse(wishlist);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

    private Wishlist getOrCreateWishlist(User user) {
        return wishlistRepository.findByUser(user)
                .orElseGet(() -> {
                    Wishlist wishlist = new Wishlist();
                    wishlist.setUser(user);
                    return wishlistRepository.save(wishlist);
                });
    }

    private WishlistResponse mapToWishlistResponse(Wishlist wishlist) {
        List<WishlistItemResponse> itemResponses = wishlistItemRepository.findByWishlist(wishlist)
                .stream()
                .map(WishlistItem::getProduct)
                .map(this::mapToWishlistItemResponse)
                .collect(Collectors.toList());

        WishlistResponse response = new WishlistResponse();
        response.setWishlistId(wishlist.getId());
        response.setUserId(wishlist.getUser().getId());
        response.setItems(itemResponses);
        return response;
    }

    private WishlistItemResponse mapToWishlistItemResponse(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        List<VariantPricingResponse> pricingList = variants.stream()
                .map(promotionPricingService::calculateVariantPricing)
                .collect(Collectors.toList());

        List<Double> originalPrices = pricingList.stream()
                .map(VariantPricingResponse::getOriginalPrice)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Double> finalPrices = pricingList.stream()
                .map(VariantPricingResponse::getFinalPrice)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

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

        WishlistItemResponse response = new WishlistItemResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setCategoryName(product.getCategory().getName());
        response.setBrandName(product.getBrand().getName());
        response.setSportName(product.getSport().getName());
        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial());
        response.setThumbnailUrl(product.getThumbnailUrl());
        response.setIsActive(product.getIsActive());

        response.setMinPrice(finalPrices.stream().min(Double::compareTo).orElse(null));
        response.setMaxPrice(finalPrices.stream().max(Double::compareTo).orElse(null));
        response.setColorCount(colorCount);

        response.setOriginalMinPrice(originalPrices.stream().min(Double::compareTo).orElse(null));
        response.setOriginalMaxPrice(originalPrices.stream().max(Double::compareTo).orElse(null));
        response.setSaleMinPrice(finalPrices.stream().min(Double::compareTo).orElse(null));
        response.setSaleMaxPrice(finalPrices.stream().max(Double::compareTo).orElse(null));
        response.setMaxDiscountPercent(maxDiscountPercent);
        response.setOnPromotion(onPromotion);
        response.setFlashSale(flashSale);

        return response;
    }
}
