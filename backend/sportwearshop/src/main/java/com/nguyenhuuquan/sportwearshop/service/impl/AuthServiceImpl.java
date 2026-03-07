package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.RoleName;
import com.nguyenhuuquan.sportwearshop.dto.auth.AuthResponse;
import com.nguyenhuuquan.sportwearshop.dto.auth.LoginRequest;
import com.nguyenhuuquan.sportwearshop.dto.auth.RegisterRequest;
import com.nguyenhuuquan.sportwearshop.dto.auth.UserResponse;
import com.nguyenhuuquan.sportwearshop.entity.Role;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.repository.RoleRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.security.JwtService;
import com.nguyenhuuquan.sportwearshop.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role USER"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setMessage("Đăng ký thành công");
        response.setUser(mapToUserResponse(savedUser));
        String token = jwtService.generateToken(savedUser.getEmail());
        response.setToken(token);

        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!isPasswordMatch) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        AuthResponse response = new AuthResponse();
        response.setMessage("Đăng nhập thành công");
        response.setToken(jwtService.generateToken(user.getEmail()));
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

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return mapToUserResponse(user);
    }
}