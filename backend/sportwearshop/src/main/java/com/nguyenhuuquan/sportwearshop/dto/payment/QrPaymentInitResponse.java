package com.nguyenhuuquan.sportwearshop.dto.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QrPaymentInitResponse {
    private Long orderId;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentCode;
    private String qrImageUrl;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private Long amount;
    private String qrExpiresAt;
    private String message;
}
