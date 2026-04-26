package com.nguyenhuuquan.sportwearshop.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InitQrCheckoutSessionRequest {
    @NotBlank(message = "shippingAddress không được để trống")
    private String shippingAddress;

    @NotBlank(message = "receiverName không được để trống")
    private String receiverName;

    @NotBlank(message = "receiverPhone không được để trống")
    private String receiverPhone;

    private String note;
}
