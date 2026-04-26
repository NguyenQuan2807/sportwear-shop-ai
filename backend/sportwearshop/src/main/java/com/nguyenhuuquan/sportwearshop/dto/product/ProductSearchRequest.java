package com.nguyenhuuquan.sportwearshop.dto.product;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductSearchRequest {
    private String keyword;
    private Long categoryId;
    private List<Long> categoryIds;
<<<<<<< HEAD
    private String categoryGroup;
=======
>>>>>>> 50dba78b38cf71386a1b587603f562797cc4498d
    private Long brandId;
    private Long sportId;
    private Gender gender;
    private Boolean promotionOnly = false;
    private Long promotionId;
    private Double minPrice;
    private Double maxPrice;
    private String sort = "newest";
    private Integer page = 0;
    private Integer size = 12;
}
