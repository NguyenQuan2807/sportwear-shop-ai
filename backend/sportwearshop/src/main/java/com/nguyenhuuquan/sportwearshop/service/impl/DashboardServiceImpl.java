package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.dto.dashboard.DashboardStatsResponse;
import com.nguyenhuuquan.sportwearshop.dto.dashboard.OrderStatusStatsResponse;
import com.nguyenhuuquan.sportwearshop.dto.dashboard.RevenueByMonthResponse;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderResponse;
import com.nguyenhuuquan.sportwearshop.entity.Order;
import com.nguyenhuuquan.sportwearshop.repository.OrderRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(ProductRepository productRepository,
                                OrderRepository orderRepository,
                                UserRepository userRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();

        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        double totalRevenue = allOrders.stream()
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();

        List<OrderResponse> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        List<RevenueByMonthResponse> revenueByMonths = buildRevenueByMonths(allOrders);
        List<OrderStatusStatsResponse> orderStatusStats = buildOrderStatusStats(allOrders);

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalProducts(totalProducts);
        response.setTotalOrders(totalOrders);
        response.setTotalUsers(totalUsers);
        response.setTotalRevenue(totalRevenue);
        response.setRecentOrders(recentOrders);
        response.setRevenueByMonths(revenueByMonths);
        response.setOrderStatusStats(orderStatusStats);

        return response;
    }

    private List<RevenueByMonthResponse> buildRevenueByMonths(List<Order> orders) {
        Map<String, Double> revenueMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");

        for (Order order : orders) {
            if (order.getCreatedAt() == null) continue;

            String monthKey = order.getCreatedAt().format(formatter);
            double amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;

            revenueMap.put(monthKey, revenueMap.getOrDefault(monthKey, 0.0) + amount);
        }

        return revenueMap.entrySet().stream().map(entry -> {
            RevenueByMonthResponse item = new RevenueByMonthResponse();
            item.setMonth(entry.getKey());
            item.setRevenue(entry.getValue());
            return item;
        }).collect(Collectors.toList());
    }

    private List<OrderStatusStatsResponse> buildOrderStatusStats(List<Order> orders) {
        Map<String, Long> statusMap = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return statusMap.entrySet().stream().map(entry -> {
            OrderStatusStatsResponse item = new OrderStatusStatsResponse();
            item.setStatus(entry.getKey());
            item.setCount(entry.getValue());
            return item;
        }).collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setShippingAddress(order.getShippingAddress());
        response.setCreatedAt(order.getCreatedAt().toString());
        return response;
    }
}