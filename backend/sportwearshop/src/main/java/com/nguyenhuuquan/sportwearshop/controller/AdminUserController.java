package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.admin.AdminUserResponse;
import com.nguyenhuuquan.sportwearshop.dto.admin.UpdateAdminUserRequest;
import com.nguyenhuuquan.sportwearshop.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<AdminUserResponse> getAllUsers() {
        return adminUserService.getAllUsers();
    }

    @PutMapping("/{id}")
    public AdminUserResponse updateUser(@PathVariable Long id,
                                        @Valid @RequestBody UpdateAdminUserRequest request,
                                        Authentication authentication) {
        return adminUserService.updateUser(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        adminUserService.deleteUser(id, authentication.getName());
    }
}
