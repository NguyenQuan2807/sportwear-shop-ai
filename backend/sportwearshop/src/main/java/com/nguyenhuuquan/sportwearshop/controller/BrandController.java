package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.brand.BrandResponse;
import com.nguyenhuuquan.sportwearshop.dto.brand.TopBrandResponse;
import com.nguyenhuuquan.sportwearshop.service.BrandService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/top")
    public List<TopBrandResponse> getTopBrands(
            @RequestParam(defaultValue = "3") int limit
    ) {
        return brandService.getTopBrandsForHome(limit);
    }

    @GetMapping("/{id}")
    public BrandResponse getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }
}