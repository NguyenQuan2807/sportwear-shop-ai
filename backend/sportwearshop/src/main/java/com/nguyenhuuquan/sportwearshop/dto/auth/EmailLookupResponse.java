package com.nguyenhuuquan.sportwearshop.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailLookupResponse {
    private String email;
    private boolean exists;
    private boolean verified;
    private String action;
}
