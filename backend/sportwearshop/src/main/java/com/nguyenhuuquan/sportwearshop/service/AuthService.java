package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.auth.*;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse verifyRegistrationCode(VerifyEmailCodeRequest request);
    AuthResponse login(LoginRequest request);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    AuthResponse refreshToken(String refreshToken);
    UserResponse getCurrentUser(String email);
}
