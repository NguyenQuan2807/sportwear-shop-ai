package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.cart.AddToCartRequest;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartItemResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.UpdateCartItemRequest;
import com.nguyenhuuquan.sportwearshop.dto.promotion.VariantPricingResponse;
import com.nguyenhuuquan.sportwearshop.entity.Cart;
import com.nguyenhuuquan.sportwearshop.entity.CartItem;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.entity.ProductImage;
import com.nguyenhuuquan.sportwearshop.repository.ProductImageRepository;
import com.nguyenhuuquan.sportwearshop.repository.CartItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.CartRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.CartService;
import com.nguyenhuuquan.sportwearshop.service.PromotionPricingService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionPricingService promotionPricingService;
    private final ProductImageRepository productImageRepository;

    public CartServiceImpl(
            UserRepository userRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductVariantRepository productVariantRepository,
            PromotionPricingService promotionPricingService,
            ProductImageRepository productImageRepository
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.promotionPricingService = promotionPricingService;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public CartResponse getMyCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(String email, AddToCartRequest request) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        ProductVariant productVariant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm"));

        if (request.getQuantity() > productVariant.getStockQuantity()) {
            throw new BadRequestException("Số lượng vượt quá tồn kho");
        }

        CartItem cartItem = cartItemRepository.findByCartAndProductVariant(cart, productVariant)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProductVariant(productVariant);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        if (newQuantity > productVariant.getStockQuantity()) {
            throw new BadRequestException("Tổng số lượng trong giỏ vượt quá tồn kho");
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(String email, Long cartItemId, UpdateCartItemRequest request) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cart item"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new UnauthorizedException("Bạn không có quyền cập nhật cart item này");
        }

        if (request.getQuantity() > cartItem.getProductVariant().getStockQuantity()) {
            throw new BadRequestException("Số lượng vượt quá tồn kho");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    public void removeCartItem(String email, Long cartItemId) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cart item"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new UnauthorizedException("Bạn không có quyền xóa cart item này");
        }

        cartItemRepository.delete(cartItem);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        double subTotalAmount = itemResponses.stream()
                .mapToDouble(item -> (item.getOriginalPrice() != null ? item.getOriginalPrice() : 0.0) * item.getQuantity())
                .sum();

        double discountAmount = itemResponses.stream()
                .mapToDouble(item -> (item.getDiscountAmount() != null ? item.getDiscountAmount() : 0.0) * item.getQuantity())
                .sum();

        double totalAmount = itemResponses.stream()
                .mapToDouble(item -> item.getTotalPrice() != null ? item.getTotalPrice() : 0.0)
                .sum();

        CartResponse response = new CartResponse();
        response.setCartId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setItems(itemResponses);
        response.setSubTotalAmount(subTotalAmount);
        response.setDiscountAmount(discountAmount);
        response.setTotalAmount(totalAmount);

        return response;
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        ProductVariant variant = cartItem.getProductVariant();
        VariantPricingResponse pricing = promotionPricingService.calculateVariantPricing(variant);

        double originalPrice = pricing.getOriginalPrice() != null
                ? pricing.getOriginalPrice()
                : variant.getPrice();

        double finalPrice = pricing.getFinalPrice() != null
                ? pricing.getFinalPrice()
                : variant.getPrice();

        double discountAmount = pricing.getDiscountAmount() != null
                ? pricing.getDiscountAmount()
                : 0.0;

        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setProductId(variant.getProduct().getId());
        response.setProductVariantId(variant.getId());
        response.setProductName(variant.getProduct().getName());
        response.setThumbnailUrl(resolveCartItemThumbnail(variant));
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());

        response.setPrice(finalPrice);
        response.setOriginalPrice(originalPrice);
        response.setFinalPrice(finalPrice);
        response.setDiscountAmount(discountAmount);
        response.setOnPromotion(pricing.getOnPromotion());
        response.setFlashSale(pricing.getFlashSale());
        response.setPromotionName(
                pricing.getAppliedPromotion() != null
                        ? pricing.getAppliedPromotion().getPromotionName()
                        : null
        );

        response.setQuantity(cartItem.getQuantity());
        response.setTotalPrice(finalPrice * cartItem.getQuantity());
        response.setStockQuantity(variant.getStockQuantity());

        return response;
    }

    private String resolveCartItemThumbnail(ProductVariant variant) {
        Long productId = variant.getProduct().getId();
        String color = variant.getColor() != null ? variant.getColor().trim() : null;

        if (color != null && !color.isEmpty()) {
            List<ProductImage> colorImages =
                    productImageRepository.findByProductIdAndColorIgnoreCaseOrderBySortOrderAscIdAsc(productId, color);

            if (!colorImages.isEmpty()) {
                ProductImage thumbnail = colorImages.stream()
                        .filter(image -> Boolean.TRUE.equals(image.getIsThumbnail()))
                        .findFirst()
                        .orElse(colorImages.get(0));

                return thumbnail.getImageUrl();
            }
        }

        List<ProductImage> commonImages =
                productImageRepository.findByProductIdAndColorIsNullOrderBySortOrderAscIdAsc(productId);

        if (!commonImages.isEmpty()) {
            ProductImage thumbnail = commonImages.stream()
                    .filter(image -> Boolean.TRUE.equals(image.getIsThumbnail()))
                    .findFirst()
                    .orElse(commonImages.get(0));

            return thumbnail.getImageUrl();
        }

        return variant.getProduct().getThumbnailUrl();
    }
}