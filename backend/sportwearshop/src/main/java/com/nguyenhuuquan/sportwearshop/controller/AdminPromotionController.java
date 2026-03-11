package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.promotion.CreatePromotionRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.UpdatePromotionRequest;
import com.nguyenhuuquan.sportwearshop.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin(origins = "*")
public class AdminPromotionController {

    private final PromotionService promotionService;

    public AdminPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public List<PromotionResponse> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @GetMapping("/{id}")
    public PromotionResponse getPromotionById(@PathVariable Long id) {
        return promotionService.getPromotionById(id);
    }

    @PostMapping
    public PromotionResponse createPromotion(@Valid @RequestBody CreatePromotionRequest request) {
        return promotionService.createPromotion(request);
    }

    @PutMapping("/{id}")
    public PromotionResponse updatePromotion(@PathVariable Long id,
                                             @Valid @RequestBody UpdatePromotionRequest request) {
        return promotionService.updatePromotion(id, request);
    }

    @DeleteMapping("/{id}")
    public String deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return "Xóa promotion thành công";
    }
}