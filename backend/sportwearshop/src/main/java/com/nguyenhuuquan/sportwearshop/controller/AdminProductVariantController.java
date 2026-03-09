package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductVariantResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductVariantRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductVariantRequest;
import com.nguyenhuuquan.sportwearshop.service.AdminProductVariantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/product-variants")
@CrossOrigin(origins = "*")
public class AdminProductVariantController {

    private final AdminProductVariantService adminProductVariantService;

    public AdminProductVariantController(AdminProductVariantService adminProductVariantService) {
        this.adminProductVariantService = adminProductVariantService;
    }

    @GetMapping("/product/{productId}")
    public List<AdminProductVariantResponse> getVariantsByProductId(@PathVariable Long productId) {
        return adminProductVariantService.getVariantsByProductId(productId);
    }

    @PostMapping("/product/{productId}")
    public AdminProductVariantResponse createVariant(@PathVariable Long productId,
                                                     @Valid @RequestBody CreateProductVariantRequest request) {
        return adminProductVariantService.createVariant(productId, request);
    }

    @PutMapping("/{variantId}")
    public AdminProductVariantResponse updateVariant(@PathVariable Long variantId,
                                                     @Valid @RequestBody UpdateProductVariantRequest request) {
        return adminProductVariantService.updateVariant(variantId, request);
    }

    @DeleteMapping("/{variantId}")
    public String deleteVariant(@PathVariable Long variantId) {
        adminProductVariantService.deleteVariant(variantId);
        return "Xóa biến thể sản phẩm thành công";
    }
}