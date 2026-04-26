package com.nguyenhuuquan.sportwearshop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_webhook_logs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_payment_webhook_external_txn", columnNames = "external_transaction_id")
        })
@Getter
@Setter
public class PaymentWebhookLog extends BaseEntity {

    @Column(name = "provider", nullable = false, length = 30)
    private String provider;

    @Column(name = "external_transaction_id", nullable = false, length = 120)
    private String externalTransactionId;

    @Column(name = "raw_payload", columnDefinition = "LONGTEXT", nullable = false)
    private String rawPayload;
}
