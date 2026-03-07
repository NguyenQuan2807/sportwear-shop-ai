package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.order.CreateOrderRequest;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderResponse;
import com.nguyenhuuquan.sportwearshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderDetailResponse createOrder(Authentication authentication,
                                           @Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(authentication.getName(), request);
    }

    @GetMapping
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        return orderService.getMyOrders(authentication.getName());
    }

    @GetMapping("/{orderId}")
    public OrderDetailResponse getMyOrderDetail(Authentication authentication,
                                                @PathVariable Long orderId) {
        return orderService.getMyOrderDetail(authentication.getName(), orderId);
    }
}