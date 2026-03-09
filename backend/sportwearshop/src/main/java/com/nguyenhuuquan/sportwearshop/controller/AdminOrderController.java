package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.order.OrderDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.order.OrderResponse;
import com.nguyenhuuquan.sportwearshop.dto.order.UpdateOrderStatusRequest;
import com.nguyenhuuquan.sportwearshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrdersForAdmin();
    }

    @GetMapping("/{orderId}")
    public OrderDetailResponse getOrderDetail(@PathVariable Long orderId) {
        return orderService.getOrderDetailForAdmin(orderId);
    }

    @PutMapping("/{orderId}/status")
    public OrderDetailResponse updateOrderStatus(@PathVariable Long orderId,
                                                 @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(orderId, request);
    }
}