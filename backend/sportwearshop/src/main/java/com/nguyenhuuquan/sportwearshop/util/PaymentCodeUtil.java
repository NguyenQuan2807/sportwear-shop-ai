package com.nguyenhuuquan.sportwearshop.util;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class PaymentCodeUtil {

    private static final String CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private PaymentCodeUtil() {
    }

    public static String generate(String prefix, int randomLength) {
        StringBuilder builder = new StringBuilder(prefix == null ? "" : prefix.toUpperCase(Locale.ROOT));
        for (int i = 0; i < randomLength; i++) {
            builder.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return builder.toString();
    }

    public static String extractFromContent(String content, String prefix) {
        if (content == null || content.isBlank() || prefix == null || prefix.isBlank()) {
            return null;
        }

        String normalizedPrefix = Pattern.quote(prefix.toUpperCase(Locale.ROOT));
        Pattern pattern = Pattern.compile("(" + normalizedPrefix + "[A-Z0-9]{6,12})");
        Matcher matcher = pattern.matcher(content.toUpperCase(Locale.ROOT));
        return matcher.find() ? matcher.group(1) : null;
    }
}
