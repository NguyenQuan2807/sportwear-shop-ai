package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionResponse;
import com.nguyenhuuquan.sportwearshop.service.PromotionService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/active")
    public List<PromotionResponse> getActivePromotions() {
        return promotionService.getActivePublicPromotions();
    }

    @GetMapping("/visible")
    public List<PromotionResponse> getVisiblePromotions() {
        return promotionService.getVisiblePublicPromotions();
    }
}
