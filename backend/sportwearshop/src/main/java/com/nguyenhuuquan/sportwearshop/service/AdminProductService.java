package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductRequest;

import java.util.List;

public interface AdminProductService {
    List<AdminProductResponse> getAllProducts();
    AdminProductResponse getProductById(Long id);
    AdminProductResponse createProduct(CreateProductRequest request);
    AdminProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
}