package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.PromotionTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromotionTargetRepository extends JpaRepository<PromotionTarget, Long> {
    List<PromotionTarget> findByPromotionId(Long promotionId);
}