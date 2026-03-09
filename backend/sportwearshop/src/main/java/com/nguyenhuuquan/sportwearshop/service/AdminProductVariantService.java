package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductVariantRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductVariantRequest;

import java.util.List;

public interface AdminProductVariantService {
    List<AdminProductVariantResponse> getVariantsByProductId(Long productId);
    AdminProductVariantResponse createVariant(Long productId, CreateProductVariantRequest request);
    AdminProductVariantResponse updateVariant(Long variantId, UpdateProductVariantRequest request);
    void deleteVariant(Long variantId);
}