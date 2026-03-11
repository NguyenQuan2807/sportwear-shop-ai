package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.DiscountType;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionTargetType;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionType;
import com.nguyenhuuquan.sportwearshop.dto.promotion.AppliedPromotionInfoResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.Promotion;
import com.nguyenhuuquan.sportwearshop.entity.PromotionTarget;
import com.nguyenhuuquan.sportwearshop.repository.PromotionRepository;
import com.nguyenhuuquan.sportwearshop.repository.PromotionTargetRepository;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PromotionPricingServiceImpl implements PromotionPricingService {

    private final PromotionRepository promotionRepository;
    private final PromotionTargetRepository promotionTargetRepository;

    public PromotionPricingServiceImpl(PromotionRepository promotionRepository,
                                       PromotionTargetRepository promotionTargetRepository) {
        this.promotionRepository = promotionRepository;
        this.promotionTargetRepository = promotionTargetRepository;
    }

    @Override
    public VariantPricingResponse calculateVariantPricing(ProductVariant variant) {
        Double originalPrice = variant.getPrice();
        Product product = variant.getProduct();

        List<Promotion> matchedPromotions = findMatchedPromotions(variant, product);

        if (matchedPromotions.isEmpty()) {
            VariantPricingResponse response = new VariantPricingResponse();
            response.setOriginalPrice(originalPrice);
            response.setFinalPrice(originalPrice);
            response.setDiscountAmount(0.0);
            response.setDiscountPercent(0);
            response.setOnPromotion(false);
            response.setFlashSale(false);
            response.setAppliedPromotion(null);
            return response;
        }

        Promotion bestPromotion = matchedPromotions.stream()
                .sorted((a, b) -> {
                    int priorityCompare = Integer.compare(
                            b.getPriority() != null ? b.getPriority() : 0,
                            a.getPriority() != null ? a.getPriority() : 0
                    );
                    if (priorityCompare != 0) {
                        return priorityCompare;
                    }

                    double finalPriceA = calculateFinalPrice(originalPrice, a);
                    double finalPriceB = calculateFinalPrice(originalPrice, b);
                    return Double.compare(finalPriceA, finalPriceB);
                })
                .findFirst()
                .orElse(null);

        double finalPrice = calculateFinalPrice(originalPrice, bestPromotion);
        double discountAmount = Math.max(0.0, originalPrice - finalPrice);

        int discountPercent = 0;
        if (originalPrice != null && originalPrice > 0) {
            discountPercent = (int) Math.round((discountAmount / originalPrice) * 100);
        }

        AppliedPromotionInfoResponse appliedPromotion = new AppliedPromotionInfoResponse();
        appliedPromotion.setPromotionId(bestPromotion.getId());
        appliedPromotion.setPromotionName(bestPromotion.getName());
        appliedPromotion.setPromotionType(bestPromotion.getPromotionType().name());
        appliedPromotion.setFlashSale(bestPromotion.getPromotionType() == PromotionType.FLASH_SALE);
        appliedPromotion.setPriority(bestPromotion.getPriority());

        VariantPricingResponse response = new VariantPricingResponse();
        response.setOriginalPrice(originalPrice);
        response.setFinalPrice(finalPrice);
        response.setDiscountAmount(discountAmount);
        response.setDiscountPercent(discountPercent);
        response.setOnPromotion(discountAmount > 0);
        response.setFlashSale(bestPromotion.getPromotionType() == PromotionType.FLASH_SALE);
        response.setAppliedPromotion(appliedPromotion);

        return response;
    }

    private List<Promotion> findMatchedPromotions(ProductVariant variant, Product product) {
        List<Promotion> allPromotions = promotionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        Set<Long> matchedTargetIds = new HashSet<>();
        matchedTargetIds.add(variant.getId());

        matchedTargetIds.add(product.getId());
        matchedTargetIds.add(product.getCategory().getId());
        matchedTargetIds.add(product.getBrand().getId());
        matchedTargetIds.add(product.getSport().getId());

        Map<Long, List<PromotionTarget>> targetMap = promotionTargetRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(target -> target.getPromotion().getId()));

        return allPromotions.stream()
                .filter(promotion -> Boolean.TRUE.equals(promotion.getIsActive()))
                .filter(promotion -> promotion.getStatus() == PromotionStatus.ACTIVE)
                .filter(promotion -> promotion.getStartTime() != null && promotion.getEndTime() != null)
                .filter(promotion -> !now.isBefore(promotion.getStartTime()) && !now.isAfter(promotion.getEndTime()))
                .filter(promotion -> isPromotionMatched(promotion, targetMap.getOrDefault(promotion.getId(), List.of()), variant, product))
                .collect(Collectors.toList());
    }

    private boolean isPromotionMatched(Promotion promotion,
                                       List<PromotionTarget> targets,
                                       ProductVariant variant,
                                       Product product) {
        for (PromotionTarget target : targets) {
            PromotionTargetType type = target.getTargetType();
            Long targetId = target.getTargetId();

            if (type == PromotionTargetType.PRODUCT_VARIANT && Objects.equals(targetId, variant.getId())) {
                return true;
            }
            if (type == PromotionTargetType.PRODUCT && Objects.equals(targetId, product.getId())) {
                return true;
            }
            if (type == PromotionTargetType.CATEGORY && Objects.equals(targetId, product.getCategory().getId())) {
                return true;
            }
            if (type == PromotionTargetType.BRAND && Objects.equals(targetId, product.getBrand().getId())) {
                return true;
            }
            if (type == PromotionTargetType.SPORT && Objects.equals(targetId, product.getSport().getId())) {
                return true;
            }
        }

        return false;
    }

    private double calculateFinalPrice(Double originalPrice, Promotion promotion) {
        if (originalPrice == null) return 0.0;

        double finalPrice = originalPrice;

        if (promotion.getDiscountType() == DiscountType.PERCENT) {
            double discountAmount = originalPrice * (promotion.getDiscountValue() / 100.0);
            if (promotion.getMaxDiscountValue() != null) {
                discountAmount = Math.min(discountAmount, promotion.getMaxDiscountValue());
            }
            finalPrice = originalPrice - discountAmount;
        } else if (promotion.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            finalPrice = originalPrice - promotion.getDiscountValue();
        } else if (promotion.getDiscountType() == DiscountType.FIXED_PRICE) {
            finalPrice = promotion.getDiscountValue();
        }

        return Math.max(0.0, finalPrice);
    }
}