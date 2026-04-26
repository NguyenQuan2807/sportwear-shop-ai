package com.nguyenhuuquan.sportwearshop.repository;

import com.nguyenhuuquan.sportwearshop.entity.CheckoutPaymentSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckoutPaymentSessionRepository extends JpaRepository<CheckoutPaymentSession, Long> {
    Optional<CheckoutPaymentSession> findByPaymentCode(String paymentCode);
}
