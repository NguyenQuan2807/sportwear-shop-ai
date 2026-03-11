package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "original_price", nullable = false)
    private Double originalPrice;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Column(name = "final_price", nullable = false)
    private Double finalPrice;

    @Column(nullable = false)
    private Double price;

    @Column(name = "promotion_name")
    private String promotionName;
}