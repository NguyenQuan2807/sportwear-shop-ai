package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.enums.OrderStatus;
import com.nguyenhuuquan.sportwearshop.common.enums.PaymentStatus;
import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.order.*;
import com.nguyenhuuquan.sportwearshop.entity.*;
import com.nguyenhuuquan.sportwearshop.repository.*;
import com.nguyenhuuquan.sportwearshop.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionPricingService promotionPricingService;

    public OrderServiceImpl(UserRepository userRepository,
                            CartRepository cartRepository,
                            CartItemRepository cartItemRepository,
                            OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            PaymentRepository paymentRepository,
                            ProductVariantRepository productVariantRepository,
                            PromotionPricingService promotionPricingService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.productVariantRepository = productVariantRepository;
        this.promotionPricingService = promotionPricingService;
    }

    @Override
    @Transactional
    public OrderDetailResponse createOrder(String email, CreateOrderRequest request) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng đang trống");
        }

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            if (cartItem.getQuantity() > variant.getStockQuantity()) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
            }
        }

        double subTotalAmount = 0.0;
        double discountAmount = 0.0;
        double totalAmount = 0.0;

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);

            double originalPrice = pricing.getOriginalPrice() != null
                    ? pricing.getOriginalPrice()
                    : variant.getPrice();

            double finalPrice = pricing.getFinalPrice() != null
                    ? pricing.getFinalPrice()
                    : variant.getPrice();

            double itemDiscountAmount = pricing.getDiscountAmount() != null
                    ? pricing.getDiscountAmount()
                    : 0.0;

            subTotalAmount += originalPrice * cartItem.getQuantity();
            discountAmount += itemDiscountAmount * cartItem.getQuantity();
            totalAmount += finalPrice * cartItem.getQuantity();
        }

        Order order = new Order();
        order.setUser(user);
        order.setSubTotalAmount(subTotalAmount);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingAddress(request.getShippingAddress());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setNote(request.getNote());

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);

            double originalPrice = pricing.getOriginalPrice() != null
                    ? pricing.getOriginalPrice()
                    : variant.getPrice();

            double finalPrice = pricing.getFinalPrice() != null
                    ? pricing.getFinalPrice()
                    : variant.getPrice();

            double itemDiscountAmount = pricing.getDiscountAmount() != null
                    ? pricing.getDiscountAmount()
                    : 0.0;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setOriginalPrice(originalPrice);
            orderItem.setDiscountAmount(itemDiscountAmount);
            orderItem.setFinalPrice(finalPrice);
            orderItem.setPrice(finalPrice);
            orderItem.setPromotionName(
                    pricing.getAppliedPromotion() != null
                            ? pricing.getAppliedPromotion().getPromotionName()
                            : null
            );

            orderItemRepository.save(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);
        }

        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        cartItemRepository.deleteAll(cartItems);

        return mapToOrderDetailResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getMyOrders(String email) {
        User user = getUserByEmail(email);
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderDetailResponse getMyOrderDetail(String email, Long orderId) {
        User user = getUserByEmail(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Bạn không có quyền xem đơn hàng này");
        }

        return mapToOrderDetailResponse(order);
    }

    @Override
    public List<OrderResponse> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderDetailResponse getOrderDetailForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        return mapToOrderDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        order.setStatus(request.getStatus());
        orderRepository.save(order);

        return mapToOrderDetailResponse(order);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setShippingAddress(order.getShippingAddress());
        response.setCreatedAt(order.getCreatedAt().toString());
        return response;
    }

    private OrderDetailResponse mapToOrderDetailResponse(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        List<OrderItemResponse> itemResponses = orderItems.stream().map(item -> {
            ProductVariant variant = item.getProductVariant();

            OrderItemResponse response = new OrderItemResponse();
            response.setId(item.getId());
            response.setProductId(variant.getProduct().getId());
            response.setProductVariantId(variant.getId());
            response.setProductName(variant.getProduct().getName());
            response.setThumbnailUrl(variant.getProduct().getThumbnailUrl());
            response.setSize(variant.getSize());
            response.setColor(variant.getColor());
            response.setPrice(item.getPrice());
            response.setQuantity(item.getQuantity());
            response.setTotalPrice(item.getFinalPrice() * item.getQuantity());
            response.setOriginalPrice(item.getOriginalPrice());
            response.setDiscountAmount(item.getDiscountAmount());
            response.setFinalPrice(item.getFinalPrice());
            response.setPromotionName(item.getPromotionName());
            return response;
        }).collect(Collectors.toList());

        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setShippingAddress(order.getShippingAddress());
        response.setNote(order.getNote());
        response.setCreatedAt(order.getCreatedAt().toString());
        response.setItems(itemResponses);

        return response;
    }
}