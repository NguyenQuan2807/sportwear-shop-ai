package com.nguyenhuuquan.sportwearshop.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SepayWebhookRequest {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String code;
    private String content;
    private String transferType;
    private Long transferAmount;
    private Long accumulated;
    private String subAccount;
    private String referenceCode;
    private String description;
}
