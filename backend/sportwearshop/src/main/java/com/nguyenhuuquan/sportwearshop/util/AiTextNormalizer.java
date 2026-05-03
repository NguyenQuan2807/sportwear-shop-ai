package com.nguyenhuuquan.sportwearshop.util;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class AiTextNormalizer {

    private AiTextNormalizer() {
    }

    public static String normalize(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9.,]+", " ")
                .trim();
    }

    public static Set<String> tokens(String value) {
        String normalized = normalize(value);
        if (!hasText(normalized)) {
            return Set.of();
        }

        return Arrays.stream(normalized.split("\\s+"))
                .map(String::trim)
                .filter(token -> !token.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public static boolean containsAny(Set<String> tokens, String... values) {
        for (String value : values) {
            if (tokens.contains(value)) {
                return true;
            }
        }
        return false;
    }

    public static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public static String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
