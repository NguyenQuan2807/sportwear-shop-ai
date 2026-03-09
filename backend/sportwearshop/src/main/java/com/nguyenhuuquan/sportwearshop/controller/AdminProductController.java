package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductRequest;
import com.nguyenhuuquan.sportwearshop.service.AdminProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public List<AdminProductResponse> getAllProducts() {
        return adminProductService.getAllProducts();
    }

    @GetMapping("/{id}")
    public AdminProductResponse getProductById(@PathVariable Long id) {
        return adminProductService.getProductById(id);
    }

    @PostMapping
    public AdminProductResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        return adminProductService.createProduct(request);
    }

    @PutMapping("/{id}")
    public AdminProductResponse updateProduct(@PathVariable Long id,
                                              @Valid @RequestBody UpdateProductRequest request) {
        return adminProductService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return "Xóa sản phẩm thành công";
    }
}