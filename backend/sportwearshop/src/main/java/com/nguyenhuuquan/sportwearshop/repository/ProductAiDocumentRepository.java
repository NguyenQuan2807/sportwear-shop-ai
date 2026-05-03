package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.ProductAiDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductAiDocumentRepository extends JpaRepository<ProductAiDocument, Long>, JpaSpecificationExecutor<ProductAiDocument> {
    Optional<ProductAiDocument> findByProductId(Long productId);
}
