package com.nguyenhuuquan.sportwearshop.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private LocalDate dateOfBirth;

    private String currentPassword;

    private String newPassword;
}
