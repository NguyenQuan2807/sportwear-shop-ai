package com.nguyenhuuquan.sportwearshop.dto.adminproduct;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductImageRequest {

    @NotBlank(message = "imageUrl không được để trống")
    private String imageUrl;

    private Boolean isThumbnail;
    private Integer sortOrder;
}