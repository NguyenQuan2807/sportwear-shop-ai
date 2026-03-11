package com.nguyenhuuquan.sportwearshop.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusStatsResponse {
    private String status;
    private long count;
}