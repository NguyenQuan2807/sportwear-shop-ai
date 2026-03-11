package com.nguyenhuuquan.sportwearshop.dto.dashboard;

import com.nguyenhuuquan.sportwearshop.dto.order.OrderResponse;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DashboardStatsResponse {
    private long totalProducts;
    private long totalOrders;
    private long totalUsers;
    private double totalRevenue;

    private List<OrderResponse> recentOrders;
    private List<RevenueByMonthResponse> revenueByMonths;
    private List<OrderStatusStatsResponse> orderStatusStats;
}