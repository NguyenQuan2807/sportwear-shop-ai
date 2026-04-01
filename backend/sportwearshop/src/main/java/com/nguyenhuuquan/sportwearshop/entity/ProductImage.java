package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter
@Setter
public class ProductImage extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "color")
    private String color;

    @Column(name = "is_thumbnail")
    private Boolean isThumbnail = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}