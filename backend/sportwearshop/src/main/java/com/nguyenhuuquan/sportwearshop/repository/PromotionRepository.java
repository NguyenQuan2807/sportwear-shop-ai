package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    boolean existsBySlug(String slug);
    Optional<Promotion> findBySlug(String slug);
}