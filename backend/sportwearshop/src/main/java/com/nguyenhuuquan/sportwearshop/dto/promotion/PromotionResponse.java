package com.nguyenhuuquan.sportwearshop.dto.promotion;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PromotionResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String promotionType;
    private String discountType;
    private Double discountValue;
    private Double maxDiscountValue;
    private Integer priority;
    private String startTime;
    private String endTime;
    private String status;
    private Boolean isActive;
    private String bannerImageUrl;
    private List<PromotionTargetResponse> targets;
}