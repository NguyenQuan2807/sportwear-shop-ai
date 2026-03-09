package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.AdminProductResponse;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.CreateProductRequest;
import com.nguyenhuuquan.sportwearshop.dto.adminproduct.UpdateProductRequest;
import com.nguyenhuuquan.sportwearshop.entity.Brand;
import com.nguyenhuuquan.sportwearshop.entity.Category;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.Sport;
import com.nguyenhuuquan.sportwearshop.repository.BrandRepository;
import com.nguyenhuuquan.sportwearshop.repository.CategoryRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.SportRepository;
import com.nguyenhuuquan.sportwearshop.service.AdminProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SportRepository sportRepository;

    public AdminProductServiceImpl(ProductRepository productRepository,
                                   CategoryRepository categoryRepository,
                                   BrandRepository brandRepository,
                                   SportRepository sportRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.sportRepository = sportRepository;
    }

    @Override
    public List<AdminProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        return mapToResponse(product);
    }

    @Override
    public AdminProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug sản phẩm đã tồn tại");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category"));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy brand"));

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sport"));

        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setSport(sport);
        product.setGender(request.getGender());
        product.setMaterial(request.getMaterial());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setIsActive(true);

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public AdminProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category"));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy brand"));

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sport"));

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setSport(sport);
        product.setGender(request.getGender());
        product.setMaterial(request.getMaterial());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setIsActive(request.getIsActive());

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        productRepository.delete(product);
    }

    private AdminProductResponse mapToResponse(Product product) {
        AdminProductResponse response = new AdminProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setCategoryName(product.getCategory().getName());
        response.setBrandName(product.getBrand().getName());
        response.setSportName(product.getSport().getName());
        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial());
        response.setThumbnailUrl(product.getThumbnailUrl());
        response.setIsActive(product.getIsActive());
        response.setCategoryId(product.getCategory().getId());
        response.setBrandId(product.getBrand().getId());
        response.setSportId(product.getSport().getId());
        return response;
    }
}