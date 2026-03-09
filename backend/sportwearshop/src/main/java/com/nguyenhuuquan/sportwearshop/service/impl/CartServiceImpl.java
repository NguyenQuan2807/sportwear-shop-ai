package com.nguyenhuuquan.sportwearshop.service.impl;

import com.nguyenhuuquan.sportwearshop.common.exception.BadRequestException;
import com.nguyenhuuquan.sportwearshop.common.exception.ResourceNotFoundException;
import com.nguyenhuuquan.sportwearshop.common.exception.UnauthorizedException;
import com.nguyenhuuquan.sportwearshop.dto.cart.AddToCartRequest;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartItemResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.CartResponse;
import com.nguyenhuuquan.sportwearshop.dto.cart.UpdateCartItemRequest;
import com.nguyenhuuquan.sportwearshop.entity.Cart;
import com.nguyenhuuquan.sportwearshop.entity.CartItem;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import com.nguyenhuuquan.sportwearshop.entity.User;
import com.nguyenhuuquan.sportwearshop.repository.CartItemRepository;
import com.nguyenhuuquan.sportwearshop.repository.CartRepository;
import com.nguyenhuuquan.sportwearshop.repository.ProductVariantRepository;
import com.nguyenhuuquan.sportwearshop.repository.UserRepository;
import com.nguyenhuuquan.sportwearshop.service.CartService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartServiceImpl(UserRepository userRepository,
                           CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductVariantRepository productVariantRepository) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
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

        List<CartItemResponse> itemResponses = cartItems.stream().map(this::mapToCartItemResponse).collect(Collectors.toList());

        double totalAmount = itemResponses.stream()
                .mapToDouble(CartItemResponse::getTotalPrice)
                .sum();

        CartResponse response = new CartResponse();
        response.setCartId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setItems(itemResponses);
        response.setTotalAmount(totalAmount);

        return response;
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        ProductVariant variant = cartItem.getProductVariant();

        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setProductId(variant.getProduct().getId());
        response.setProductVariantId(variant.getId());
        response.setProductName(variant.getProduct().getName());
        response.setThumbnailUrl(variant.getProduct().getThumbnailUrl());
        response.setSize(variant.getSize());
        response.setColor(variant.getColor());
        response.setPrice(variant.getPrice());
        response.setQuantity(cartItem.getQuantity());
        response.setTotalPrice(variant.getPrice() * cartItem.getQuantity());

        return response;
    }
}