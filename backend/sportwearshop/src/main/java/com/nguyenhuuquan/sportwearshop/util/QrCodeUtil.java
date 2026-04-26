package com.nguyenhuuquan.sportwearshop.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public final class QrCodeUtil {

    private QrCodeUtil() {
    }

    public static String buildSepayQrImageUrl(String accountNumber, String bankName, Long amount, String description) {
        return "https://qr.sepay.vn/img"
                + "?acc=" + encode(accountNumber)
                + "&bank=" + encode(bankName)
                + "&amount=" + amount
                + "&des=" + encode(description);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
