package com.nguyenhuuquan.sportwearshop.controller;

import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionRequest;
import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.QrCheckoutSessionStatusResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.SepayWebhookRequest;
import com.nguyenhuuquan.sportwearshop.service.BankQrPaymentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/qr")
@CrossOrigin(origins = "*")
public class BankQrPaymentController {

    private final BankQrPaymentService bankQrPaymentService;

    public BankQrPaymentController(BankQrPaymentService bankQrPaymentService) {
        this.bankQrPaymentService = bankQrPaymentService;
    }

    @PostMapping("/checkout-session/init")
    public InitQrCheckoutSessionResponse initCheckoutSession(Authentication authentication,
                                                             @Valid @RequestBody InitQrCheckoutSessionRequest request) {
        return bankQrPaymentService.initCheckoutSession(authentication.getName(), request);
    }

    @GetMapping("/checkout-session/{sessionId}")
    public QrCheckoutSessionStatusResponse getCheckoutSessionStatus(Authentication authentication,
                                                                    @PathVariable Long sessionId) {
        return bankQrPaymentService.getCheckoutSessionStatus(authentication.getName(), sessionId);
    }

    @PostMapping("/webhook/sepay")
    public Map<String, Object> sepayWebhook(@RequestParam("token") String token,
                                            @RequestBody SepayWebhookRequest request) {
        return bankQrPaymentService.handleSepayWebhook(token, request);
    }
}
