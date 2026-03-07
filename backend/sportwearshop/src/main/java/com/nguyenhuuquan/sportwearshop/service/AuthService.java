package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.auth.AuthResponse;
import com.nguyenhuuquan.sportwearshop.dto.auth.LoginRequest;
import com.nguyenhuuquan.sportwearshop.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}