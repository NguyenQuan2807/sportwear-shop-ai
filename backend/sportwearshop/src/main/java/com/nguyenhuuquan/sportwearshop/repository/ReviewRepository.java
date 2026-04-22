package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.OrderItem;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.Review;
import com.nguyenhuuquan.sportwearshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItem(OrderItem orderItem);

    Optional<Review> findByOrderItem(OrderItem orderItem);

    Optional<Review> findByIdAndUser(Long id, User user);

    List<Review> findByProductOrderByCreatedAtDesc(Product product);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId")
    Double getAverageRatingByProductId(Long productId);

    @Query("select count(r) from Review r where r.product.id = :productId")
    Long countByProductId(Long productId);
}
