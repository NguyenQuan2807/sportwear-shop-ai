package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressRequest;
import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.ProfileResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.UpdateProfileRequest;

import java.util.List;

public interface ProfileService {
    ProfileResponse getMyProfile(String email);
    ProfileResponse updateMyProfile(String email, UpdateProfileRequest request);
    List<DeliveryAddressResponse> getMyAddresses(String email);
    DeliveryAddressResponse createMyAddress(String email, DeliveryAddressRequest request);
    DeliveryAddressResponse updateMyAddress(String email, Long addressId, DeliveryAddressRequest request);
    void deleteMyAddress(String email, Long addressId);
}
