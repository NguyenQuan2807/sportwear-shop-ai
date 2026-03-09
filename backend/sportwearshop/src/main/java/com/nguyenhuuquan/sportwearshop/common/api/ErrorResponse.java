package com.nguyenhuuquan.sportwearshop.common.api;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ErrorResponse {

    private boolean success;
    private String message;
    private Object errors;
    private LocalDateTime timestamp;

}