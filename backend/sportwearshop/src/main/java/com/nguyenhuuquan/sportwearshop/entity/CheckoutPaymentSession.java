package com.nguyenhuuquan.sportwearshop.entity;

import com.nguyenhuuquan.sportwearshop.common.enums.PaymentMethod;
import com.nguyenhuuquan.sportwearshop.common.enums.QrCheckoutSessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkout_payment_sessions")
@Getter
@Setter
public class CheckoutPaymentSession extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "status", nullable = false, length = 20)
    private QrCheckoutSessionStatus status;

    @Column(name = "shipping_address", columnDefinition = "TEXT", nullable = false)
    private String shippingAddress;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    private String receiverPhone;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "sub_total_amount", nullable = false)
    private Double subTotalAmount;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_code", nullable = false, unique = true, length = 120)
    private String paymentCode;

    @Column(name = "qr_image_url", columnDefinition = "TEXT")
    private String qrImageUrl;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "provider_transaction_id", length = 120)
    private String providerTransactionId;

    @Column(name = "cart_snapshot", columnDefinition = "LONGTEXT", nullable = false)
    private String cartSnapshot;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "raw_response", columnDefinition = "LONGTEXT")
    private String rawResponse;
}
