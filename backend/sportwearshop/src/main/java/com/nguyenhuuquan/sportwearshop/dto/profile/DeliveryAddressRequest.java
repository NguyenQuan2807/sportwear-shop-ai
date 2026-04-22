package com.nguyenhuuquan.sportwearshop.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryAddressRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String addressLine;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String provinceCode;

    @NotBlank(message = "Tên tỉnh/Thành phố không được để trống")
    private String provinceName;

    @NotBlank(message = "Huyện không được để trống")
    private String districtCode;

    @NotBlank(message = "Tên huyện không được để trống")
    private String districtName;

    @NotBlank(message = "Xã/Phường không được để trống")
    private String wardCode;

    @NotBlank(message = "Tên xã/phường không được để trống")
    private String wardName;

    private Boolean isDefault;
}
