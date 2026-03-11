package com.nguyenhuuquan.sportwearshop.dto.promotion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PromotionTargetResponse {
    private Long id;
    private String targetType;
    private Long targetId;
}