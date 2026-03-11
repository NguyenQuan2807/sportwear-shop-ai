package com.nguyenhuuquan.sportwearshop.dto.promotion;

import com.nguyenhuuquan.sportwearshop.common.enums.DiscountType;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PromotionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UpdatePromotionRequest {

    @NotBlank(message = "Tên chương trình không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;

    @NotNull(message = "Promotion type không được để trống")
    private PromotionType promotionType;

    @NotNull(message = "Discount type không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Discount value không được để trống")
    private Double discountValue;

    private Double maxDiscountValue;

    private Integer priority = 0;

    @NotNull(message = "Start time không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "End time không được để trống")
    private LocalDateTime endTime;

    private PromotionStatus status = PromotionStatus.DRAFT;
    private Boolean isActive = true;
    private String bannerImageUrl;

    @NotEmpty(message = "Phải có ít nhất một target")
    private List<PromotionTargetRequest> targets;
}