package com.nguyenhuuquan.sportwearshop.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String message;
    private UserResponse user;
}