package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.promotion.CreatePromotionRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionTargetRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.PromotionTargetResponse;
import com.nguyenhuuquan.sportwearshop.dto.promotion.UpdatePromotionRequest;
import com.nguyenhuuquan.sportwearshop.entity.Promotion;
import com.nguyenhuuquan.sportwearshop.entity.PromotionTarget;
import com.nguyenhuuquan.sportwearshop.repository.PromotionRepository;
import com.nguyenhuuquan.sportwearshop.repository.PromotionTargetRepository;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import com.nguyenhuuquan.sportwearshop.service.PromotionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionTargetRepository promotionTargetRepository;
    private final FileStorageService fileStorageService;

    public PromotionServiceImpl(
            PromotionRepository promotionRepository,
            PromotionTargetRepository promotionTargetRepository,
            FileStorageService fileStorageService
    ) {
        this.promotionRepository = promotionRepository;
        this.promotionTargetRepository = promotionTargetRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionResponse> getActivePublicPromotions() {
        LocalDateTime now = LocalDateTime.now();

        return promotionRepository.findAll()
                .stream()
                .filter(promotion -> Boolean.TRUE.equals(promotion.getIsActive()))
                .filter(promotion -> promotion.getStatus() != null && "ACTIVE".equals(promotion.getStatus().name()))
                .filter(promotion -> promotion.getStartTime() != null && !promotion.getStartTime().isAfter(now))
                .filter(promotion -> promotion.getEndTime() != null && !promotion.getEndTime().isBefore(now))
                .sorted((a, b) -> Integer.compare(
                        b.getPriority() != null ? b.getPriority() : 0,
                        a.getPriority() != null ? a.getPriority() : 0
                ))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion"));
        return mapToResponse(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(CreatePromotionRequest request) {
        if (promotionRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug promotion đã tồn tại");
        }

        validateTimeRange(request.getStartTime(), request.getEndTime());

        Promotion promotion = new Promotion();
        applyPromotionData(promotion, request);

        Promotion savedPromotion = promotionRepository.save(promotion);
        saveTargets(savedPromotion, request.getTargets());

        return mapToResponse(savedPromotion);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, UpdatePromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion"));

        if (!promotion.getSlug().equals(request.getSlug()) && promotionRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug promotion đã tồn tại");
        }

        validateTimeRange(request.getStartTime(), request.getEndTime());

        String oldBannerImageUrl = promotion.getBannerImageUrl();
        applyPromotionData(promotion, request);

        Promotion savedPromotion = promotionRepository.save(promotion);

        List<PromotionTarget> oldTargets = promotionTargetRepository.findByPromotionId(savedPromotion.getId());
        promotionTargetRepository.deleteAll(oldTargets);
        saveTargets(savedPromotion, request.getTargets());

        if (hasFileChanged(oldBannerImageUrl, savedPromotion.getBannerImageUrl())) {
            fileStorageService.deleteFile(oldBannerImageUrl);
        }

        return mapToResponse(savedPromotion);
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy promotion"));

        List<PromotionTarget> targets = promotionTargetRepository.findByPromotionId(id);
        promotionTargetRepository.deleteAll(targets);

        fileStorageService.deleteFile(promotion.getBannerImageUrl());
        promotionRepository.delete(promotion);
    }

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
    }

    private void applyPromotionData(Promotion promotion, CreatePromotionRequest request) {
        promotion.setName(request.getName());
        promotion.setSlug(request.getSlug());
        promotion.setDescription(request.getDescription());
        promotion.setPromotionType(request.getPromotionType());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMaxDiscountValue(request.getMaxDiscountValue());
        promotion.setPriority(request.getPriority());
        promotion.setStartTime(request.getStartTime());
        promotion.setEndTime(request.getEndTime());
        promotion.setStatus(request.getStatus());
        promotion.setIsActive(request.getIsActive());
        promotion.setBannerImageUrl(request.getBannerImageUrl());
    }

    private void applyPromotionData(Promotion promotion, UpdatePromotionRequest request) {
        promotion.setName(request.getName());
        promotion.setSlug(request.getSlug());
        promotion.setDescription(request.getDescription());
        promotion.setPromotionType(request.getPromotionType());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMaxDiscountValue(request.getMaxDiscountValue());
        promotion.setPriority(request.getPriority());
        promotion.setStartTime(request.getStartTime());
        promotion.setEndTime(request.getEndTime());
        promotion.setStatus(request.getStatus());
        promotion.setIsActive(request.getIsActive());
        promotion.setBannerImageUrl(request.getBannerImageUrl());
    }

    private void saveTargets(Promotion promotion, List<PromotionTargetRequest> targetRequests) {
        if (targetRequests == null || targetRequests.isEmpty()) {
            return;
        }

        for (PromotionTargetRequest item : targetRequests) {
            PromotionTarget target = new PromotionTarget();
            target.setPromotion(promotion);
            target.setTargetType(item.getTargetType());
            target.setTargetId(item.getTargetId());
            promotionTargetRepository.save(target);
        }
    }

    private boolean hasFileChanged(String oldUrl, String newUrl) {
        return oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        List<PromotionTargetResponse> targets = promotionTargetRepository.findByPromotionId(promotion.getId())
                .stream()
                .map(target -> {
                    PromotionTargetResponse item = new PromotionTargetResponse();
                    item.setId(target.getId());
                    item.setTargetType(target.getTargetType().name());
                    item.setTargetId(target.getTargetId());
                    return item;
                })
                .collect(Collectors.toList());

        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setName(promotion.getName());
        response.setSlug(promotion.getSlug());
        response.setDescription(promotion.getDescription());
        response.setPromotionType(promotion.getPromotionType().name());
        response.setDiscountType(promotion.getDiscountType().name());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setMaxDiscountValue(promotion.getMaxDiscountValue());
        response.setPriority(promotion.getPriority());
        response.setStartTime(promotion.getStartTime() != null ? promotion.getStartTime().toString() : null);
        response.setEndTime(promotion.getEndTime() != null ? promotion.getEndTime().toString() : null);
        response.setStatus(promotion.getStatus().name());
        response.setIsActive(promotion.getIsActive());
        response.setBannerImageUrl(promotion.getBannerImageUrl());
        response.setTargets(targets);
        return response;
    }
}
