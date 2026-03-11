package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.promotion.CreatePromotionRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.UpdatePromotionRequest;

import java.util.List;

public interface PromotionService {
    List<PromotionResponse> getAllPromotions();
    PromotionResponse getPromotionById(Long id);
    PromotionResponse createPromotion(CreatePromotionRequest request);
    PromotionResponse updatePromotion(Long id, UpdatePromotionRequest request);
    void deletePromotion(Long id);
}