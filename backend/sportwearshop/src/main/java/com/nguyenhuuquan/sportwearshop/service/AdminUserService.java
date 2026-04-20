package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.admin.AdminUserResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.UpdateAdminUserRequest;

import java.util.List;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();
    AdminUserResponse updateUser(Long id, UpdateAdminUserRequest request, String currentAdminEmail);
    void deleteUser(Long id, String currentAdminEmail);
}
