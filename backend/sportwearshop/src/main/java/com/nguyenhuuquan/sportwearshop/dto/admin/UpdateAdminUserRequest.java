package com.nguyenhuuquan.sportwearshop.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAdminUserRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String phone;
    private String address;

    @NotBlank(message = "Role không được để trống")
    private String roleName;

    private Boolean emailVerified;
}
