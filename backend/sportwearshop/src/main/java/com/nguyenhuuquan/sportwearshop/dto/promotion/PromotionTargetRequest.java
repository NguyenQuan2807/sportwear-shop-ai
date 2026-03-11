package com.nguyenhuuquan.sportwearshop.dto.promotion;

import com.nguyenhuuquan.sportwearshop.common.enums.PromotionTargetType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PromotionTargetRequest {

    @NotNull(message = "Loại target không được để trống")
    private PromotionTargetType targetType;

    @NotNull(message = "Target id không được để trống")
    private Long targetId;
}