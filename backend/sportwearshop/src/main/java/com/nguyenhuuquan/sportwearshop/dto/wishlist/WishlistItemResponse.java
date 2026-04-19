package com.nguyenhuuquan.sportwearshop.dto.wishlist;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistItemResponse {
    private Long id;
    private String name;
    private String slug;
    private String categoryName;
    private String brandName;
    private String sportName;
    private String gender;
    private String material;
    private String thumbnailUrl;
    private Boolean isActive;

    private Double minPrice;
    private Double maxPrice;
    private Integer colorCount;

    private Double originalMinPrice;
    private Double originalMaxPrice;
    private Double saleMinPrice;
    private Double saleMaxPrice;
    private Integer maxDiscountPercent;
    private Boolean onPromotion;
    private Boolean flashSale;
}
