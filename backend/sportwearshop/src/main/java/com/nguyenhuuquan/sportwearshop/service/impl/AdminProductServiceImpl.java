package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
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
import com.nguyenhuuquan.sportwearshop.repository.CartItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.CategoryRepository;
import com.nguyenhuuquan.sportwearshop.repository.OrderItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductRepository;
import com.nguyenhuuquan.sportwearshop.repository.SportRepository;
import com.nguyenhuuquan.sportwearshop.service.AdminProductService;
import com.nguyenhuuquan.sportwearshop.specification.ProductSpecification;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SportRepository sportRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;

    public AdminProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            SportRepository sportRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.sportRepository = sportRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    public List<AdminProductResponse> getAllProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            Long sportId,
            Gender gender,
            Boolean isActive,
            String sort
    ) {
        Specification<Product> specification = Specification
                .where(ProductSpecification.hasKeyword(keyword))
                .and(ProductSpecification.hasCategoryId(categoryId))
                .and(ProductSpecification.hasBrandId(brandId))
                .and(ProductSpecification.hasSportId(sportId))
                .and(ProductSpecification.hasGender(gender))
                .and(ProductSpecification.hasActiveStatus(isActive));

        return productRepository.findAll(specification, buildSort(sort))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Sort buildSort(String sort) {
        String sortValue = sort == null ? "newest" : sort.trim().toLowerCase(Locale.ROOT);

        return switch (sortValue) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "updated_desc" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
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

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        boolean hasOrderHistory = orderItemRepository.existsByProductVariantProductId(id);

        if (hasOrderHistory) {
            product.setIsActive(false);
            productRepository.save(product);

            cartItemRepository.deleteByProductVariantProductId(id);
            return;
        }

        cartItemRepository.deleteByProductVariantProductId(id);
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