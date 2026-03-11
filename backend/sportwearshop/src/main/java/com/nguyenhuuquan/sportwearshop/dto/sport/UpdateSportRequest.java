package com.nguyenhuuquan.sportwearshop.dto.sport;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSportRequest {

    @NotBlank(message = "Tên môn thể thao không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    private String description;
    private String iconUrl;
    private Boolean isActive = true;
}