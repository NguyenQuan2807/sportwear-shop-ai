package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.brand.BrandResponse;
import com.nguyenhuuquan.sportwearshop.dto.brand.CreateBrandRequest;
import com.nguyenhuuquan.sportwearshop.dto.brand.UpdateBrandRequest;

import java.util.List;

public interface BrandService {
    List<BrandResponse> getAllBrands();
    BrandResponse getBrandById(Long id);
    BrandResponse createBrand(CreateBrandRequest request);
    BrandResponse updateBrand(Long id, UpdateBrandRequest request);
    void deleteBrand(Long id);
}