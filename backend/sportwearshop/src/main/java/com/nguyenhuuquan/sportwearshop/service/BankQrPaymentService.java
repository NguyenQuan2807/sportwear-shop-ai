package com.nguyenhuuquan.sportwearshop.service;

import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionRequest;
import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.QrCheckoutSessionStatusResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.SepayWebhookRequest;

import java.util.Map;

public interface BankQrPaymentService {
    InitQrCheckoutSessionResponse initCheckoutSession(String email, InitQrCheckoutSessionRequest request);
    QrCheckoutSessionStatusResponse getCheckoutSessionStatus(String email, Long sessionId);
    Map<String, Object> handleSepayWebhook(String token, SepayWebhookRequest request);
}
