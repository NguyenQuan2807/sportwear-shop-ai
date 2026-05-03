package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "product_ai_documents",
        indexes = {
                @Index(name = "idx_ai_doc_product_id", columnList = "product_id"),
                @Index(name = "idx_ai_doc_category_group", columnList = "category_group"),
                @Index(name = "idx_ai_doc_gender", columnList = "gender"),
                @Index(name = "idx_ai_doc_min_price", columnList = "min_price"),
                @Index(name = "idx_ai_doc_in_stock", columnList = "in_stock"),
                @Index(name = "idx_ai_doc_active", columnList = "product_active")
        }
)
@Getter
@Setter
public class ProductAiDocument extends BaseEntity {

    @Column(name = "product_id", nullable = false, unique = true)
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_slug")
    private String productSlug;

    @Column(name = "product_url")
    private String productUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "brand_name")
    private String brandName;

    @Column(name = "brand_slug")
    private String brandSlug;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "category_slug")
    private String categorySlug;

    @Column(name = "category_group")
    private String categoryGroup;

    @Column(name = "sport_name")
    private String sportName;

    @Column(name = "sport_slug")
    private String sportSlug;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String material;

    @Column(name = "min_price")
    private Double minPrice;

    @Column(name = "max_price")
    private Double maxPrice;

    @Column(name = "min_original_price")
    private Double minOriginalPrice;

    @Column(name = "price_label")
    private String priceLabel;

    @Column(name = "in_stock")
    private Boolean inStock = false;

    @Column(name = "on_promotion")
    private Boolean onPromotion = false;

    @Column(name = "max_discount_percent")
    private Integer maxDiscountPercent = 0;

    @Column(columnDefinition = "TEXT")
    private String sizes;

    @Column(columnDefinition = "TEXT")
    private String colors;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(name = "use_cases", columnDefinition = "TEXT")
    private String useCases;

    @Column(name = "ai_tags", columnDefinition = "TEXT")
    private String aiTags;

    @Column(name = "search_text", columnDefinition = "TEXT")
    private String searchText;

    @Column(name = "searchable_text", columnDefinition = "TEXT")
    private String searchableText;

    @Column(name = "product_active")
    private Boolean productActive = true;

    @Column(name = "last_indexed_at")
    private LocalDateTime lastIndexedAt;
}
