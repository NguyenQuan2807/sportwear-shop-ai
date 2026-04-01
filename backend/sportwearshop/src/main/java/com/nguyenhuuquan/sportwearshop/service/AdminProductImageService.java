package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductImageRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductImageRequest;

import java.util.List;

public interface AdminProductImageService {

    List<AdminProductImageResponse> getImagesByProductId(Long productId);

    AdminProductImageResponse createImage(Long productId, CreateProductImageRequest request);

    AdminProductImageResponse updateImage(Long imageId, UpdateProductImageRequest request);

    void deleteImage(Long imageId);
}