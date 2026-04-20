package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.RoleName;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.admin.AdminUserResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.UpdateAdminUserRequest;
import com.nguyenhuuquan.sportwearshop.entity.Role;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.repository.RoleRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.AdminUserService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AdminUserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt).reversed())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse updateUser(Long id, UpdateAdminUserRequest request, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)
                && !user.getRole().getName().name().equals(request.getRoleName())) {
            throw new BadRequestException("Bạn không thể tự thay đổi role của chính mình");
        }

        RoleName roleName;
        try {
            roleName = RoleName.valueOf(request.getRoleName());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Role không hợp lệ");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(role);
        user.setEmailVerified(request.getEmailVerified());

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public void deleteUser(Long id, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BadRequestException("Bạn không thể tự xóa tài khoản admin đang đăng nhập");
        }

        userRepository.delete(user);
    }

    private AdminUserResponse mapToResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRoleName(user.getRole().getName().name());
        response.setEmailVerified(user.getEmailVerified());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return response;
    }
}
