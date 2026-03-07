package com.nguyenhuuquan.sportwearshop.dto.order;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderDetailResponse {
    private Long id;
    private Double totalAmount;
    private String status;
    private String paymentMethod;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String note;
    private String createdAt;
    private List<OrderItemResponse> items;
}