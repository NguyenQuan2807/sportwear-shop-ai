package com.nguyenhuuquan.sportwearshop.dto.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InitQrCheckoutSessionResponse {
    private Long sessionId;
    private String paymentCode;
    private String paymentMethod;
    private String status;
    private String qrImageUrl;
    private Long amount;
    private String expiresAt;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String message;
}
