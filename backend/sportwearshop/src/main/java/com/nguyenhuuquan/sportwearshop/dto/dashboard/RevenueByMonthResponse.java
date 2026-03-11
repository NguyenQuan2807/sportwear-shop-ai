package com.nguyenhuuquan.sportwearshop.dto.dashboard;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RevenueByMonthResponse {
    private String month;
    private double revenue;
}