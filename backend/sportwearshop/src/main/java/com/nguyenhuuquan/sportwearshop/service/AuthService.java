package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.auth.*;

public interface AuthService {
    EmailLookupResponse checkEmail(String email);
    MessageResponse requestRegisterCode(RegisterCodeRequest request);
    AuthResponse completeRegister(CompleteRegisterRequest request);
    AuthResponse login(LoginRequest request);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    AuthResponse refreshToken(String refreshToken);
    UserResponse getCurrentUser(String email);
}
