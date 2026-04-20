package com.nguyenhuuquan.sportwearshop.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String roleName;
    private Boolean emailVerified;
    private String createdAt;
}
