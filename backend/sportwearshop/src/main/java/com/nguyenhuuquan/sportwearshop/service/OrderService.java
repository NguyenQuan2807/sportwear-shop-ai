package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.order.CreateOrderRequest;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderDetailResponse createOrder(String email, CreateOrderRequest request);
    List<OrderResponse> getMyOrders(String email);
    OrderDetailResponse getMyOrderDetail(String email, Long orderId);
}