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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class AdminProductImageServiceImpl implements AdminProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public AdminProductImageServiceImpl(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public List<AdminProductImageResponse> getImagesByProductId(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAscIdAsc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AdminProductImageResponse createImage(Long productId, CreateProductImageRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        String normalizedColor = normalizeColor(request.getColor());
        List<ProductImage> existingGroup = getImagesInColorGroup(productId, normalizedColor);

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.getImageUrl());
        image.setColor(normalizedColor);
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        boolean shouldBeThumbnail =
                Boolean.TRUE.equals(request.getIsThumbnail()) || existingGroup.isEmpty();

        image.setIsThumbnail(shouldBeThumbnail);

        ProductImage saved = productImageRepository.save(image);

        if (shouldBeThumbnail) {
            ensureSingleThumbnail(saved);
        } else {
            promoteFirstImageAsThumbnail(productId, normalizedColor);
        }

        return mapToResponse(saved);
    }

    @Override
    public AdminProductImageResponse updateImage(Long imageId, UpdateProductImageRequest request) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh sản phẩm"));

        Long productId = image.getProduct().getId();
        String previousColor = normalizeColor(image.getColor());
        boolean previousThumbnail = Boolean.TRUE.equals(image.getIsThumbnail());

        image.setImageUrl(request.getImageUrl());
        image.setColor(normalizeColor(request.getColor()));
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        image.setIsThumbnail(Boolean.TRUE.equals(request.getIsThumbnail()));

        ProductImage saved = productImageRepository.save(image);
        String currentColor = normalizeColor(saved.getColor());

        if (Boolean.TRUE.equals(saved.getIsThumbnail())) {
            ensureSingleThumbnail(saved);
        }

        if (previousThumbnail || !Objects.equals(previousColor, currentColor)) {
            promoteFirstImageAsThumbnail(productId, previousColor);
            promoteFirstImageAsThumbnail(productId, currentColor);
        }

        return mapToResponse(saved);
    }

    @Override
    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh sản phẩm"));

        Long productId = image.getProduct().getId();
        String color = normalizeColor(image.getColor());
        boolean wasThumbnail = Boolean.TRUE.equals(image.getIsThumbnail());

        productImageRepository.delete(image);

        if (wasThumbnail) {
            promoteFirstImageAsThumbnail(productId, color);
        }
    }

    private void ensureSingleThumbnail(ProductImage currentImage) {
        List<ProductImage> imagesInGroup = getImagesInColorGroup(
                currentImage.getProduct().getId(),
                normalizeColor(currentImage.getColor())
        );

        for (ProductImage image : imagesInGroup) {
            if (!image.getId().equals(currentImage.getId()) && Boolean.TRUE.equals(image.getIsThumbnail())) {
                image.setIsThumbnail(false);
            }
        }

        productImageRepository.saveAll(imagesInGroup);
    }

    private void promoteFirstImageAsThumbnail(Long productId, String color) {
        List<ProductImage> imagesInGroup = getImagesInColorGroup(productId, color);

        if (imagesInGroup.isEmpty()) {
            return;
        }

        boolean hasThumbnail = imagesInGroup.stream()
                .anyMatch(image -> Boolean.TRUE.equals(image.getIsThumbnail()));

        if (!hasThumbnail) {
            ProductImage firstImage = imagesInGroup.get(0);
            firstImage.setIsThumbnail(true);
            productImageRepository.save(firstImage);
        }
    }

    private List<ProductImage> getImagesInColorGroup(Long productId, String color) {
        if (color == null) {
            return productImageRepository.findByProductIdAndColorIsNullOrderBySortOrderAscIdAsc(productId);
        }

        return productImageRepository.findByProductIdAndColorIgnoreCaseOrderBySortOrderAscIdAsc(productId, color);
    }

    private String normalizeColor(String color) {
        if (color == null) {
            return null;
        }

        String trimmed = color.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AdminProductImageResponse mapToResponse(ProductImage image) {
        AdminProductImageResponse response = new AdminProductImageResponse();
        response.setId(image.getId());
        response.setProductId(image.getProduct().getId());
        response.setImageUrl(image.getImageUrl());
        response.setColor(image.getColor());
        response.setIsThumbnail(image.getIsThumbnail());
        response.setSortOrder(image.getSortOrder());
        return response;
    }
}