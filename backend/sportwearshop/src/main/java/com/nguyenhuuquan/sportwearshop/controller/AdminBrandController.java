package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.brand.BrandResponse;
import com.nguyenhuuquan.sportwearshop.dto.brand.CreateBrandRequest;
import com.nguyenhuuquan.sportwearshop.dto.brand.UpdateBrandRequest;
import com.nguyenhuuquan.sportwearshop.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@CrossOrigin(origins = "*")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/{id}")
    public BrandResponse getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }

    @PostMapping
    public BrandResponse createBrand(@Valid @RequestBody CreateBrandRequest request) {
        return brandService.createBrand(request);
    }

    @PutMapping("/{id}")
    public BrandResponse updateBrand(@PathVariable Long id,
                                     @Valid @RequestBody UpdateBrandRequest request) {
        return brandService.updateBrand(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return "Xóa thương hiệu thành công";
    }
}