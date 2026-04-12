package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.brand.BrandResponse;
import com.nguyenhuuquan.sportwearshop.dto.brand.CreateBrandRequest;
import com.nguyenhuuquan.sportwearshop.dto.brand.UpdateBrandRequest;
import com.nguyenhuuquan.sportwearshop.entity.Brand;
import com.nguyenhuuquan.sportwearshop.repository.BrandRepository;
import com.nguyenhuuquan.sportwearshop.service.BrandService;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import org.springframework.stereotype.Service;
import com.nguyenhuuquan.sportwearshop.dto.brand.TopBrandResponse;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final FileStorageService fileStorageService;

    public BrandServiceImpl(BrandRepository brandRepository, FileStorageService fileStorageService) {
        this.brandRepository = brandRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BrandResponse getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu"));
        return mapToResponse(brand);
    }

    @Override
    public BrandResponse createBrand(CreateBrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên thương hiệu đã tồn tại");
        }
        if (brandRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }

        Brand brand = new Brand();
        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setIsActive(true);

        return mapToResponse(brandRepository.save(brand));
    }

    @Override
    public BrandResponse updateBrand(Long id, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu"));

        String oldLogoUrl = brand.getLogoUrl();

        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setIsActive(request.getIsActive());

        Brand savedBrand = brandRepository.save(brand);

        if (hasFileChanged(oldLogoUrl, savedBrand.getLogoUrl())) {
            fileStorageService.deleteFile(oldLogoUrl);
        }

        return mapToResponse(savedBrand);
    }

    @Override
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu"));

        fileStorageService.deleteFile(brand.getLogoUrl());
        brandRepository.delete(brand);
    }

    @Override
    public List<TopBrandResponse> getTopBrandsForHome(int limit) {
        int safeLimit = limit <= 0 ? 3 : Math.min(limit, 10);
        return brandRepository.findTopBrandsForHome(PageRequest.of(0, safeLimit));
    }

    private boolean hasFileChanged(String oldUrl, String newUrl) {
        return oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl);
    }

    private BrandResponse mapToResponse(Brand brand) {
        BrandResponse response = new BrandResponse();
        response.setId(brand.getId());
        response.setName(brand.getName());
        response.setSlug(brand.getSlug());
        response.setDescription(brand.getDescription());
        response.setLogoUrl(brand.getLogoUrl());
        response.setIsActive(brand.getIsActive());
        return response;
    }
}