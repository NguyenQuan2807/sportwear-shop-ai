package com.nguyenhuuquan.sportwearshop.dto.profile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryAddressResponse {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String addressLine;
    private String provinceCode;
    private String provinceName;
    private String districtCode;
    private String districtName;
    private String wardCode;
    private String wardName;
    private Boolean isDefault;
}
