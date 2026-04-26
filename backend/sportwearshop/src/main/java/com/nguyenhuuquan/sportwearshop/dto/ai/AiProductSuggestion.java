package com.nguyenhuuquan.sportwearshop.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiProductSuggestion {

    private Long id;
    private String name;
    private String brandName;
    private String categoryName;
    private String sportName;
    private String gender;
    private String thumbnailUrl;
    private String priceLabel;
    private String productUrl;
    private String reason;
}
