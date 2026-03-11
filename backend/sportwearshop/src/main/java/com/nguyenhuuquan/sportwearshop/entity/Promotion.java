package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.DiscountType;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
public class Promotion extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type", nullable = false)
    private PromotionType promotionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "max_discount_value")
    private Double maxDiscountValue;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionStatus status = PromotionStatus.DRAFT;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "banner_image_url")
    private String bannerImageUrl;
}