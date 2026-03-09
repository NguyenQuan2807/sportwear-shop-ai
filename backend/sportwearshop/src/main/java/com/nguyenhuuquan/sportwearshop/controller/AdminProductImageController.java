package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductImageResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductImageRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductImageRequest;
import com.nguyenhuuquan.sportwearshop.service.AdminProductImageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/product-images")
@CrossOrigin(origins = "*")
public class AdminProductImageController {

    private final AdminProductImageService adminProductImageService;

    public AdminProductImageController(AdminProductImageService adminProductImageService) {
        this.adminProductImageService = adminProductImageService;
    }

    @GetMapping("/product/{productId}")
    public List<AdminProductImageResponse> getImagesByProductId(@PathVariable Long productId) {
        return adminProductImageService.getImagesByProductId(productId);
    }

    @PostMapping("/product/{productId}")
    public AdminProductImageResponse createImage(@PathVariable Long productId,
                                                 @Valid @RequestBody CreateProductImageRequest request) {
        return adminProductImageService.createImage(productId, request);
    }

    @PutMapping("/{imageId}")
    public AdminProductImageResponse updateImage(@PathVariable Long imageId,
                                                 @Valid @RequestBody UpdateProductImageRequest request) {
        return adminProductImageService.updateImage(imageId, request);
    }

    @DeleteMapping("/{imageId}")
    public String deleteImage(@PathVariable Long imageId) {
        adminProductImageService.deleteImage(imageId);
        return "Xóa ảnh sản phẩm thành công";
    }
}