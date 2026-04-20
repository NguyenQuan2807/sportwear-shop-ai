package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.RoleName;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.auth.*;
import com.nguyenhuuquan.sportwearshop.entity.Role;
import com.nguyenhuuquan.sportwearshop.entity.User;
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

    @Value("${app.auth.verification-code-expiration-minutes:10}")
    private long verificationCodeExpirationMinutes;

    @Value("${app.auth.reset-password-code-expiration-minutes:10}")
    private long resetPasswordCodeExpirationMinutes;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Override
    public MessageResponse register(RegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null && Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role USER"));

        if (user == null) {
            user = new User();
        }

        String verificationCode = generateSixDigitCode();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(userRole);
        user.setEmailVerified(false);
        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusMinutes(verificationCodeExpirationMinutes));
        user.setResetPasswordCode(null);
        user.setResetPasswordExpiresAt(null);

        userRepository.save(user);

        emailService.sendEmail(
                user.getEmail(),
                "Mã xác thực đăng ký Sportwear Shop AI",
                buildRegisterVerificationEmail(user.getFullName(), verificationCode)
        );

        return new MessageResponse("Mã xác thực đã được gửi tới email của bạn");
    }

    @Override
    public AuthResponse verifyRegistrationCode(VerifyEmailCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return buildAuthResponse(user, "Email đã được xác thực trước đó");
        }

        validateCode(user.getEmailVerificationCode(), user.getEmailVerificationExpiresAt(), request.getCode(), "Mã xác thực không hợp lệ hoặc đã hết hạn");

        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiresAt(null);
        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser, "Xác thực email thành công");
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
            throw new UnauthorizedException("Email chưa được xác thực. Vui lòng kiểm tra mã xác thực trong email.");
        }

        return buildAuthResponse(user, "Đăng nhập thành công");
    }

    @Override
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            String resetCode = generateSixDigitCode();
            user.setResetPasswordCode(resetCode);
            user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(resetPasswordCodeExpirationMinutes));
            userRepository.save(user);

            emailService.sendEmail(
                    user.getEmail(),
                    "Mã đặt lại mật khẩu Sportwear Shop AI",
                    buildResetPasswordEmail(user.getFullName(), resetCode)
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

    private String generateSixDigitCode() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    private String buildRegisterVerificationEmail(String fullName, String code) {
        return "Xin chào " + (fullName != null ? fullName : "bạn") + ",\n\n"
                + "Mã xác thực đăng ký của bạn là: " + code + "\n"
                + "Mã này sẽ hết hạn sau " + verificationCodeExpirationMinutes + " phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.";
    }

    private String buildResetPasswordEmail(String fullName, String code) {
        return "Xin chào " + (fullName != null ? fullName : "bạn") + ",\n\n"
                + "Mã đặt lại mật khẩu của bạn là: " + code + "\n"
                + "Mã này sẽ hết hạn sau " + resetPasswordCodeExpirationMinutes + " phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.";
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
        response.setRoleName(user.getRole().getName().name());
        return response;
    }
}
