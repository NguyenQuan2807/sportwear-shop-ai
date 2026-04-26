package com.nguyenhuuquan.sportwearshop.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nguyenhuuquan.sportwearshop.common.enums.OrderStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PaymentMethod;
import com.nguyenhuuquan.sportwearshop.common.enums.PaymentStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.QrCheckoutSessionStatus;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.payment.CartItemSnapshot;
import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionRequest;
import com.nguyenhuuquan.sportwearshop.dto.payment.InitQrCheckoutSessionResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.QrCheckoutSessionStatusResponse;
import com.nguyenhuuquan.sportwearshop.dto.payment.SepayWebhookRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.*;
import com.nguyenhuuquan.sportwearshop.repository.*;
import com.nguyenhuuquan.sportwearshop.service.BankQrPaymentService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import com.nguyenhuuquan.sportwearshop.util.PaymentCodeUtil;
import com.nguyenhuuquan.sportwearshop.util.QrCodeUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class BankQrPaymentServiceImpl implements BankQrPaymentService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionPricingService promotionPricingService;
    private final CheckoutPaymentSessionRepository checkoutPaymentSessionRepository;
    private final PaymentWebhookLogRepository paymentWebhookLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.payment.bank-qr.bank-name}")
    private String bankName;

    @Value("${app.payment.bank-qr.account-number}")
    private String accountNumber;

    @Value("${app.payment.bank-qr.account-holder}")
    private String accountHolder;

    @Value("${app.payment.bank-qr.qr-expire-minutes:1}")
    private long qrExpireMinutes;

    @Value("${app.payment.bank-qr.payment-code-prefix:SW}")
    private String paymentCodePrefix;

    @Value("${app.payment.bank-qr.sepay.webhook-token}")
    private String sepayWebhookToken;

    public BankQrPaymentServiceImpl(UserRepository userRepository,
                                    CartRepository cartRepository,
                                    CartItemRepository cartItemRepository,
                                    OrderRepository orderRepository,
                                    OrderItemRepository orderItemRepository,
                                    PaymentRepository paymentRepository,
                                    ProductVariantRepository productVariantRepository,
                                    PromotionPricingService promotionPricingService,
                                    CheckoutPaymentSessionRepository checkoutPaymentSessionRepository,
                                    PaymentWebhookLogRepository paymentWebhookLogRepository,
                                    ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.productVariantRepository = productVariantRepository;
        this.promotionPricingService = promotionPricingService;
        this.checkoutPaymentSessionRepository = checkoutPaymentSessionRepository;
        this.paymentWebhookLogRepository = paymentWebhookLogRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public InitQrCheckoutSessionResponse initCheckoutSession(String email, InitQrCheckoutSessionRequest request) {
        validateConfig();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng đang trống");
        }

        double subTotalAmount = 0.0;
        double discountAmount = 0.0;
        double totalAmount = 0.0;

        List<CartItemSnapshot> snapshots = cartItems.stream().map(cartItem -> {
            ProductVariant variant = cartItem.getProductVariant();
            if (cartItem.getQuantity() > variant.getStockQuantity()) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
            }

            VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);
            double originalPrice = pricing.getOriginalPrice() != null ? pricing.getOriginalPrice() : variant.getPrice();
            double finalPrice = pricing.getFinalPrice() != null ? pricing.getFinalPrice() : variant.getPrice();
            double itemDiscountAmount = pricing.getDiscountAmount() != null ? pricing.getDiscountAmount() : 0.0;

            CartItemSnapshot snapshot = new CartItemSnapshot();
            snapshot.setProductVariantId(variant.getId());
            snapshot.setQuantity(cartItem.getQuantity());
            snapshot.setOriginalPrice(originalPrice);
            snapshot.setFinalPrice(finalPrice);
            snapshot.setDiscountAmount(itemDiscountAmount);
            snapshot.setPromotionName(pricing.getAppliedPromotion() != null ? pricing.getAppliedPromotion().getPromotionName() : null);
            return snapshot;
        }).toList();

        for (CartItemSnapshot item : snapshots) {
            subTotalAmount += item.getOriginalPrice() * item.getQuantity();
            discountAmount += item.getDiscountAmount() * item.getQuantity();
            totalAmount += item.getFinalPrice() * item.getQuantity();
        }

        CheckoutPaymentSession session = new CheckoutPaymentSession();
        session.setUser(user);
        session.setPaymentMethod(PaymentMethod.BANK_QR);
        session.setStatus(QrCheckoutSessionStatus.PENDING);
        session.setShippingAddress(request.getShippingAddress());
        session.setReceiverName(request.getReceiverName());
        session.setReceiverPhone(request.getReceiverPhone());
        session.setNote(request.getNote());
        session.setSubTotalAmount(subTotalAmount);
        session.setDiscountAmount(discountAmount);
        session.setTotalAmount(totalAmount);
        session.setPaymentCode(PaymentCodeUtil.generate(paymentCodePrefix, 8));
        session.setExpiresAt(LocalDateTime.now().plusMinutes(qrExpireMinutes));
        session.setQrImageUrl(QrCodeUtil.buildSepayQrImageUrl(accountNumber, bankName, Math.round(totalAmount), session.getPaymentCode()));
        session.setMessage("Mã QR chỉ có hiệu lực trong " + qrExpireMinutes + " phút.");

        try {
            session.setCartSnapshot(objectMapper.writeValueAsString(snapshots));
        } catch (Exception ex) {
            throw new BadRequestException("Không thể tạo snapshot giỏ hàng");
        }

        CheckoutPaymentSession saved = checkoutPaymentSessionRepository.save(session);
        return mapInitResponse(saved);
    }

    @Override
    @Transactional
    public QrCheckoutSessionStatusResponse getCheckoutSessionStatus(String email, Long sessionId) {
        CheckoutPaymentSession session = checkoutPaymentSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên thanh toán"));

        if (!session.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new UnauthorizedException("Bạn không có quyền xem phiên thanh toán này");
        }

        refreshExpiration(session);
        return mapStatusResponse(session);
    }

    @Override
    @Transactional
    public Map<String, Object> handleSepayWebhook(String token, SepayWebhookRequest request) {
        if (token == null || token.isBlank() || !Objects.equals(token, sepayWebhookToken)) {
            throw new UnauthorizedException("Webhook token không hợp lệ");
        }

        if (request == null || request.getId() == null) {
            throw new BadRequestException("Webhook không hợp lệ");
        }

        String externalTransactionId = String.valueOf(request.getId());
        if (paymentWebhookLogRepository.existsByExternalTransactionId(externalTransactionId)) {
            return Map.of("success", true);
        }

        PaymentWebhookLog webhookLog = new PaymentWebhookLog();
        webhookLog.setProvider("SEPAY");
        webhookLog.setExternalTransactionId(externalTransactionId);
        try {
            webhookLog.setRawPayload(objectMapper.writeValueAsString(request));
        } catch (Exception ex) {
            webhookLog.setRawPayload(String.valueOf(request));
        }
        paymentWebhookLogRepository.save(webhookLog);

        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            return Map.of("success", true);
        }

        String paymentCode = request.getCode() != null && !request.getCode().isBlank()
                ? request.getCode()
                : PaymentCodeUtil.extractFromContent(request.getContent(), paymentCodePrefix);

        if (paymentCode == null || paymentCode.isBlank()) {
            return Map.of("success", true);
        }

        CheckoutPaymentSession session = checkoutPaymentSessionRepository.findByPaymentCode(paymentCode).orElse(null);
        if (session == null) {
            return Map.of("success", true);
        }

        refreshExpiration(session);
        if (session.getStatus() == QrCheckoutSessionStatus.EXPIRED
                || session.getStatus() == QrCheckoutSessionStatus.FAILED
                || session.getStatus() == QrCheckoutSessionStatus.PAID) {
            return Map.of("success", true);
        }

        long transferAmount = request.getTransferAmount() == null ? 0L : request.getTransferAmount();
        long expectedAmount = Math.round(session.getTotalAmount());

        if (transferAmount < expectedAmount) {
            session.setStatus(QrCheckoutSessionStatus.FAILED);
            session.setMessage("Thanh toán thất bại vì số tiền chuyển khoản chưa đủ.");
            session.setRawResponse(webhookLog.getRawPayload());
            checkoutPaymentSessionRepository.save(session);
            return Map.of("success", true);
        }

        Order order = createOrderFromSnapshot(session);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(PaymentMethod.BANK_QR);
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setTransactionCode(session.getPaymentCode());
        payment.setProviderTransactionId(request.getReferenceCode() != null && !request.getReferenceCode().isBlank() ? request.getReferenceCode() : externalTransactionId);
        payment.setPaidAt(LocalDateTime.now());
        payment.setMessage("SePay xác nhận giao dịch chuyển khoản thành công.");
        payment.setRawResponse(webhookLog.getRawPayload());
        paymentRepository.save(payment);

        session.setOrderId(order.getId());
        session.setStatus(QrCheckoutSessionStatus.PAID);
        session.setProviderTransactionId(payment.getProviderTransactionId());
        session.setRawResponse(webhookLog.getRawPayload());
        session.setMessage("Thanh toán thành công. Đơn hàng đã được tạo.");
        checkoutPaymentSessionRepository.save(session);

        return Map.of("success", true);
    }

    private Order createOrderFromSnapshot(CheckoutPaymentSession session) {
        List<CartItemSnapshot> snapshots;
        try {
            snapshots = objectMapper.readValue(session.getCartSnapshot(), new TypeReference<List<CartItemSnapshot>>() {});
        } catch (Exception ex) {
            throw new BadRequestException("Không thể đọc snapshot giỏ hàng");
        }

        if (snapshots == null || snapshots.isEmpty()) {
            throw new BadRequestException("Snapshot giỏ hàng trống");
        }

        Order order = new Order();
        order.setUser(session.getUser());
        order.setSubTotalAmount(session.getSubTotalAmount());
        order.setDiscountAmount(session.getDiscountAmount());
        order.setTotalAmount(session.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.BANK_QR);
        order.setShippingAddress(session.getShippingAddress());
        order.setReceiverName(session.getReceiverName());
        order.setReceiverPhone(session.getReceiverPhone());
        order.setNote(session.getNote());

        Order savedOrder = orderRepository.save(order);
        Cart cart = cartRepository.findByUser(session.getUser()).orElse(null);

        for (CartItemSnapshot snapshot : snapshots) {
            ProductVariant variant = productVariantRepository.findById(snapshot.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm"));

            if (snapshot.getQuantity() > variant.getStockQuantity()) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(snapshot.getQuantity());
            orderItem.setOriginalPrice(snapshot.getOriginalPrice());
            orderItem.setDiscountAmount(snapshot.getDiscountAmount());
            orderItem.setFinalPrice(snapshot.getFinalPrice());
            orderItem.setPrice(snapshot.getFinalPrice());
            orderItem.setPromotionName(snapshot.getPromotionName());
            orderItemRepository.save(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - snapshot.getQuantity());
            productVariantRepository.save(variant);

            if (cart != null) {
                cartItemRepository.findByCartAndProductVariant(cart, variant).ifPresent(cartItemRepository::delete);
            }
        }

        return savedOrder;
    }

    private void refreshExpiration(CheckoutPaymentSession session) {
        if (session.getStatus() == QrCheckoutSessionStatus.PENDING
                && session.getExpiresAt() != null
                && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus(QrCheckoutSessionStatus.EXPIRED);
            session.setMessage("Thanh toán thất bại do mã QR đã hết hạn.");
            checkoutPaymentSessionRepository.save(session);
        }
    }

    private InitQrCheckoutSessionResponse mapInitResponse(CheckoutPaymentSession session) {
        return InitQrCheckoutSessionResponse.builder()
                .sessionId(session.getId())
                .paymentCode(session.getPaymentCode())
                .paymentMethod(session.getPaymentMethod().name())
                .status(session.getStatus().name())
                .qrImageUrl(session.getQrImageUrl())
                .amount(Math.round(session.getTotalAmount()))
                .expiresAt(session.getExpiresAt() != null ? session.getExpiresAt().toString() : null)
                .bankName(bankName)
                .accountNumber(accountNumber)
                .accountHolder(accountHolder)
                .message(session.getMessage())
                .build();
    }

    private QrCheckoutSessionStatusResponse mapStatusResponse(CheckoutPaymentSession session) {
        return QrCheckoutSessionStatusResponse.builder()
                .sessionId(session.getId())
                .paymentCode(session.getPaymentCode())
                .paymentMethod(session.getPaymentMethod().name())
                .status(session.getStatus().name())
                .orderId(session.getOrderId())
                .qrImageUrl(session.getQrImageUrl())
                .amount(Math.round(session.getTotalAmount()))
                .expiresAt(session.getExpiresAt() != null ? session.getExpiresAt().toString() : null)
                .bankName(bankName)
                .accountNumber(accountNumber)
                .accountHolder(accountHolder)
                .message(session.getMessage())
                .build();
    }

    private void validateConfig() {
        if (bankName == null || bankName.isBlank() || bankName.startsWith("CHANGE_ME")
                || accountNumber == null || accountNumber.isBlank() || accountNumber.startsWith("CHANGE_ME")
                || accountHolder == null || accountHolder.isBlank() || accountHolder.startsWith("CHANGE_ME")) {
            throw new BadRequestException("Thiếu cấu hình bank-qr trong application.yml");
        }
    }
}
