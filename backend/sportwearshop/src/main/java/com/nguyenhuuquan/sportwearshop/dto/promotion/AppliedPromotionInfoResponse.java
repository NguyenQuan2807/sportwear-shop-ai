package com.nguyenhuuquan.sportwearshop.dto.promotion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppliedPromotionInfoResponse {
    private Long promotionId;
    private String promotionName;
    private String promotionType;
    private Boolean flashSale;
    private Integer priority;
}