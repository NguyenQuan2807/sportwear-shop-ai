package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.PromotionTargetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "promotion_targets")
@Getter
@Setter
public class PromotionTarget extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private PromotionTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;
}