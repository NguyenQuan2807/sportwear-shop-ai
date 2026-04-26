package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.PaymentMethod;
import com.nguyenhuuquan.sportwearshop.common.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "transaction_code", length = 120)
    private String transactionCode;

    @Column(name = "provider_transaction_id", length = 120)
    private String providerTransactionId;

    @Column(name = "qr_image_url", columnDefinition = "TEXT")
    private String qrImageUrl;

    @Column(name = "qr_expires_at")
    private LocalDateTime qrExpiresAt;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "raw_response", columnDefinition = "LONGTEXT")
    private String rawResponse;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
