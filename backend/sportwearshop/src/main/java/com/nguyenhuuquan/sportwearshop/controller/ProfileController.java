package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressRequest;
import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.ProfileResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.UpdateProfileRequest;
import com.nguyenhuuquan.sportwearshop.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse getMyProfile(Authentication authentication) {
        return profileService.getMyProfile(authentication.getName());
    }

    @PutMapping
    public ProfileResponse updateMyProfile(Authentication authentication,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateMyProfile(authentication.getName(), request);
    }

    @GetMapping("/addresses")
    public List<DeliveryAddressResponse> getMyAddresses(Authentication authentication) {
        return profileService.getMyAddresses(authentication.getName());
    }

    @PostMapping("/addresses")
    public DeliveryAddressResponse createMyAddress(Authentication authentication,
                                                   @Valid @RequestBody DeliveryAddressRequest request) {
        return profileService.createMyAddress(authentication.getName(), request);
    }

    @PutMapping("/addresses/{addressId}")
    public DeliveryAddressResponse updateMyAddress(Authentication authentication,
                                                   @PathVariable Long addressId,
                                                   @Valid @RequestBody DeliveryAddressRequest request) {
        return profileService.updateMyAddress(authentication.getName(), addressId, request);
    }

    @DeleteMapping("/addresses/{addressId}")
    public void deleteMyAddress(Authentication authentication,
                                @PathVariable Long addressId) {
        profileService.deleteMyAddress(authentication.getName(), addressId);
    }
}
