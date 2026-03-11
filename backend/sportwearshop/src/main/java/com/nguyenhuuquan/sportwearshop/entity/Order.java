package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.OrderStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "sub_total_amount", nullable = false)
    private Double subTotalAmount;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "shipping_address", columnDefinition = "TEXT", nullable = false)
    private String shippingAddress;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    private String receiverPhone;

    @Column(columnDefinition = "TEXT")
    private String note;
}