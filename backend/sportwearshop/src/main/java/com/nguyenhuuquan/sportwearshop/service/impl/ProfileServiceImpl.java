package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressRequest;
import com.nguyenhuuquan.sportwearshop.dto.profile.DeliveryAddressResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.ProfileResponse;
import com.nguyenhuuquan.sportwearshop.dto.profile.UpdateProfileRequest;
import com.nguyenhuuquan.sportwearshop.entity.DeliveryAddress;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.repository.DeliveryAddressRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.ProfileService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final DeliveryAddressRepository deliveryAddressRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileServiceImpl(UserRepository userRepository,
                              DeliveryAddressRepository deliveryAddressRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.deliveryAddressRepository = deliveryAddressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ProfileResponse getMyProfile(String email) {
        User user = getUserByEmail(email);
        return mapProfile(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        user.setFullName(request.getFullName().trim());
        user.setDateOfBirth(request.getDateOfBirth());

        boolean wantsChangePassword = request.getNewPassword() != null && !request.getNewPassword().isBlank();
        if (wantsChangePassword) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("Vui lòng nhập mật khẩu hiện tại");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Mật khẩu hiện tại không đúng");
            }

            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return mapProfile(userRepository.save(user));
    }

    @Override
    public List<DeliveryAddressResponse> getMyAddresses(String email) {
        User user = getUserByEmail(email);
        return deliveryAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(user.getId())
                .stream()
                .map(this::mapAddress)
                .toList();
    }

    @Override
    @Transactional
    public DeliveryAddressResponse createMyAddress(String email, DeliveryAddressRequest request) {
        User user = getUserByEmail(email);

        DeliveryAddress address = new DeliveryAddress();
        applyAddress(address, request);
        address.setUser(user);

        List<DeliveryAddress> existingAddresses = deliveryAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(user.getId());

        boolean shouldDefault = Boolean.TRUE.equals(request.getIsDefault()) || existingAddresses.isEmpty();
        if (shouldDefault) {
            existingAddresses.forEach(item -> item.setIsDefault(false));
            deliveryAddressRepository.saveAll(existingAddresses);
            address.setIsDefault(true);
        } else {
            address.setIsDefault(false);
        }

        return mapAddress(deliveryAddressRepository.save(address));
    }

    @Override
    @Transactional
    public DeliveryAddressResponse updateMyAddress(String email, Long addressId, DeliveryAddressRequest request) {
        User user = getUserByEmail(email);
        DeliveryAddress address = deliveryAddressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng"));

        applyAddress(address, request);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<DeliveryAddress> addresses = deliveryAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(user.getId());
            addresses.forEach(item -> {
                if (!item.getId().equals(addressId)) {
                    item.setIsDefault(false);
                }
            });
            deliveryAddressRepository.saveAll(addresses);
            address.setIsDefault(true);
        }

        return mapAddress(deliveryAddressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteMyAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        DeliveryAddress address = deliveryAddressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng"));

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        deliveryAddressRepository.delete(address);

        if (wasDefault) {
            List<DeliveryAddress> remaining = deliveryAddressRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                DeliveryAddress first = remaining.get(0);
                first.setIsDefault(true);
                deliveryAddressRepository.save(first);
            }
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private void applyAddress(DeliveryAddress address, DeliveryAddressRequest request) {
        address.setFullName(request.getFullName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setAddressLine(request.getAddressLine().trim());
        address.setProvinceCode(request.getProvinceCode().trim());
        address.setProvinceName(request.getProvinceName().trim());
        address.setDistrictCode(request.getDistrictCode().trim());
        address.setDistrictName(request.getDistrictName().trim());
        address.setWardCode(request.getWardCode().trim());
        address.setWardName(request.getWardName().trim());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));
    }

    private ProfileResponse mapProfile(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setRoleName(user.getRole().getName().name());
        return response;
    }

    private DeliveryAddressResponse mapAddress(DeliveryAddress address) {
        DeliveryAddressResponse response = new DeliveryAddressResponse();
        response.setId(address.getId());
        response.setFullName(address.getFullName());
        response.setPhoneNumber(address.getPhoneNumber());
        response.setAddressLine(address.getAddressLine());
        response.setProvinceCode(address.getProvinceCode());
        response.setProvinceName(address.getProvinceName());
        response.setDistrictCode(address.getDistrictCode());
        response.setDistrictName(address.getDistrictName());
        response.setWardCode(address.getWardCode());
        response.setWardName(address.getWardName());
        response.setIsDefault(address.getIsDefault());
        return response;
    }
}
