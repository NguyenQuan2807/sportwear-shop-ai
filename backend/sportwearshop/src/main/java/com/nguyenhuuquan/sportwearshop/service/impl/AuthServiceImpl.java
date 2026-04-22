package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.RoleName;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.auth.*;
import com.nguyenhuuquan.sportwearshop.entity.PendingRegistration;
import com.nguyenhuuquan.sportwearshop.entity.Role;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.repository.PendingRegistrationRepository;
import com.nguyenhuuquan.sportwearshop.repository.RoleRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.security.JwtService;
import com.nguyenhuuquan.sportwearshop.service.AuthService;
import com.nguyenhuuquan.sportwearshop.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    @Value("${app.auth.verification-code-expiration-minutes:10}")
    private long verificationCodeExpirationMinutes;

    @Value("${app.auth.reset-password-code-expiration-minutes:10}")
    private long resetPasswordCodeExpirationMinutes;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           EmailService emailService,
                           PendingRegistrationRepository pendingRegistrationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
    }

    @Override
    public EmailLookupResponse checkEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        EmailLookupResponse response = new EmailLookupResponse();
        response.setEmail(email);

        if (user == null) {
            response.setExists(false);
            response.setVerified(false);
            response.setAction("REGISTER");
            return response;
        }

        boolean verified = !Boolean.FALSE.equals(user.getEmailVerified());
        response.setExists(true);
        response.setVerified(verified);
        response.setAction(verified ? "LOGIN" : "REGISTER");
        return response;
    }

    @Override
    public MessageResponse requestRegisterCode(RegisterCodeRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingUser != null && !Boolean.FALSE.equals(existingUser.getEmailVerified())) {
            throw new BadRequestException("Email này đã có tài khoản. Vui lòng đăng nhập.");
        }

        String code = generateNumericCode(8);
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail()).orElse(new PendingRegistration());
        pending.setEmail(request.getEmail());
        pending.setVerificationCode(code);
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(verificationCodeExpirationMinutes));
        pendingRegistrationRepository.save(pending);

        emailService.sendEmail(
                request.getEmail(),
                "Mã xác thực đăng ký Sportwear Shop AI",
                "Mã xác thực đăng ký của bạn là: " + code + "\nMã này sẽ hết hạn sau " + verificationCodeExpirationMinutes + " phút."
        );

        return new MessageResponse("Mã xác thực đã được gửi tới email của bạn");
    }

    @Override
    public AuthResponse completeRegister(CompleteRegisterRequest request) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy yêu cầu đăng ký cho email này"));

        validateCode(pending.getVerificationCode(), pending.getExpiresAt(), request.getCode(), "Mã xác thực không hợp lệ hoặc đã hết hạn");

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role USER"));

        User user = userRepository.findByEmail(request.getEmail()).orElse(new User());
        if (user.getId() != null && !Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(user.getPhone());
        user.setAddress(user.getAddress());
        user.setDateOfBirth(user.getDateOfBirth());
        user.setRole(userRole);
        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiresAt(null);
        user.setResetPasswordCode(null);
        user.setResetPasswordExpiresAt(null);

        User savedUser = userRepository.save(user);
        pendingRegistrationRepository.deleteByEmail(request.getEmail());

        return buildAuthResponse(savedUser, "Đăng ký thành công");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));

        boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!isPasswordMatch) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new UnauthorizedException("Email chưa được xác thực.");
        }

        return buildAuthResponse(user, "Đăng nhập thành công");
    }

    @Override
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            String resetCode = generateNumericCode(8);
            user.setResetPasswordCode(resetCode);
            user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(resetPasswordCodeExpirationMinutes));
            userRepository.save(user);

            emailService.sendEmail(
                    user.getEmail(),
                    "Mã đặt lại mật khẩu Sportwear Shop AI",
                    "Mã đặt lại mật khẩu của bạn là: " + resetCode + "\nMã này sẽ hết hạn sau " + resetPasswordCodeExpirationMinutes + " phút."
            );
        }

        return new MessageResponse("Nếu email tồn tại trong hệ thống, mã đặt lại mật khẩu đã được gửi");
    }

    @Override
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));

        validateCode(user.getResetPasswordCode(), user.getResetPasswordExpiresAt(), request.getCode(), "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordCode(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);

        return new MessageResponse("Đặt lại mật khẩu thành công");
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String email;

        try {
            email = jwtService.extractEmail(refreshToken);
        } catch (Exception ex) {
            throw new UnauthorizedException("Refresh token không hợp lệ");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Người dùng không tồn tại"));

        if (!jwtService.isRefreshTokenValid(refreshToken, user.getEmail())) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        return buildAuthResponse(user, "Làm mới token thành công");
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        return mapToUserResponse(user);
    }

    private void validateCode(String expectedCode, LocalDateTime expiresAt, String requestCode, String errorMessage) {
        if (expectedCode == null || expiresAt == null || expiresAt.isBefore(LocalDateTime.now()) || !expectedCode.equals(requestCode)) {
            throw new BadRequestException(errorMessage);
        }
    }

    private String generateNumericCode(int length) {
        Random random = new Random();
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            builder.append(random.nextInt(10));
        }
        return builder.toString();
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        AuthResponse response = new AuthResponse();
        response.setMessage(message);
        response.setToken(accessToken);
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtService.getAccessTokenExpiration());
        response.setUser(mapToUserResponse(user));
        return response;
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setRoleName(user.getRole().getName().name());
        return response;
    }
}
