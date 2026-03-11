package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.product.ProductDetailResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductPageResponse;
import com.nguyenhuuquan.sportwearshop.dto.product.ProductSearchRequest;

public interface ProductService {
    ProductPageResponse getAllProducts(ProductSearchRequest request);
    ProductDetailResponse getProductById(Long id);
}