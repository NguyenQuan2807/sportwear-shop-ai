package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAscIdAsc(Long productId);

    List<ProductImage> findByProductIdAndColorIgnoreCaseOrderBySortOrderAscIdAsc(Long productId, String color);

    List<ProductImage> findByProductIdAndColorIsNullOrderBySortOrderAscIdAsc(Long productId);
}