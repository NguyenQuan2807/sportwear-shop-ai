package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductImageRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductImageRequest;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import com.nguyenhuuquan.sportwearshop.repository.ProductImageRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.service.AdminProductImageService;
import com.nguyenhuuquan.sportwearshop.service.FileStorageService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminProductImageServiceImpl implements AdminProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final FileStorageService fileStorageService;

    public AdminProductImageServiceImpl(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            FileStorageService fileStorageService
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<AdminProductImageResponse> getImagesByProductId(Long productId) {
        return productImageRepository.findByProductId(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminProductImageResponse createImage(Long productId, CreateProductImageRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.getImageUrl());
        image.setIsThumbnail(request.getIsThumbnail() != null ? request.getIsThumbnail() : false);
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return mapToResponse(productImageRepository.save(image));
    }

    @Override
    public AdminProductImageResponse updateImage(Long imageId, UpdateProductImageRequest request) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh sản phẩm"));

        String oldImageUrl = image.getImageUrl();

        image.setImageUrl(request.getImageUrl());
        image.setIsThumbnail(request.getIsThumbnail());
        image.setSortOrder(request.getSortOrder());

        ProductImage savedImage = productImageRepository.save(image);

        if (hasFileChanged(oldImageUrl, savedImage.getImageUrl())) {
            fileStorageService.deleteFile(oldImageUrl);
        }

        return mapToResponse(savedImage);
    }

    @Override
    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh sản phẩm"));

        fileStorageService.deleteFile(image.getImageUrl());
        productImageRepository.delete(image);
    }

    private boolean hasFileChanged(String oldUrl, String newUrl) {
        return oldUrl != null && !oldUrl.isBlank() && !oldUrl.equals(newUrl);
    }

    private AdminProductImageResponse mapToResponse(ProductImage image) {
        AdminProductImageResponse response = new AdminProductImageResponse();
        response.setId(image.getId());
        response.setProductId(image.getProduct().getId());
        response.setImageUrl(image.getImageUrl());
        response.setIsThumbnail(image.getIsThumbnail());
        response.setSortOrder(image.getSortOrder());
        return response;
    }
}