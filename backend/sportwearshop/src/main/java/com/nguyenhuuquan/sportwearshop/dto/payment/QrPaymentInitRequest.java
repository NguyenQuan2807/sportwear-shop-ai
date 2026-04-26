package com.nguyenhuuquan.sportwearshop.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QrPaymentInitRequest {

    @NotNull(message = "orderId không được để trống")
    private Long orderId;
}
