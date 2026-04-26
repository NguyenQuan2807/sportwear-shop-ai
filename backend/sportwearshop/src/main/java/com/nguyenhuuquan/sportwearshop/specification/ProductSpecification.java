package com.nguyenhuuquan.sportwearshop.specification;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public class ProductSpecification {

    private static final Set<String> IGNORED_SEARCH_TOKENS = Set.of(
            "san", "pham", "sp", "hang", "mau", "loai", "cho", "cua", "va", "the", "thao",
            "size", "co", "color", "colour", "dang", "ban", "gia", "giam", "khuyen", "mai",
            "sale", "discount", "new", "moi", "ve"
    );

    private ProductSpecification() {
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    public static Specification<Product> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String phrase = keyword.trim().toLowerCase(Locale.ROOT);
            List<String> tokens = splitKeywordTokens(keyword);

            Predicate phrasePredicate = buildKeywordPredicate(root, query, cb, phrase);

            List<Predicate> tokenPredicates = tokens.stream()
                    .map(token -> buildKeywordPredicate(root, query, cb, token))
                    .collect(Collectors.toList());

            if (tokenPredicates.isEmpty()) {
                return phrasePredicate;
            }

            return cb.or(
                    phrasePredicate,
                    cb.and(tokenPredicates.toArray(new Predicate[0]))
            );
        };
    }

    private static List<String> splitKeywordTokens(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return Arrays.stream(keyword.trim().toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))
                .map(String::trim)
                .filter(token -> !token.isBlank())
                .collect(Collectors.collectingAndThen(
                        Collectors.toCollection(LinkedHashSet::new),
                        set -> set.stream()
                                .filter(token -> !isIgnoredToken(token))
                                .collect(Collectors.toList())
                ));
    }

    private static boolean isIgnoredToken(String token) {
        String normalized = normalizeToken(token);
        return IGNORED_SEARCH_TOKENS.contains(normalized);
    }

    private static Predicate buildKeywordPredicate(Root<Product> root,
                                                   CriteriaQuery<?> query,
                                                   CriteriaBuilder cb,
                                                   String rawToken) {
        String token = rawToken == null ? "" : rawToken.trim().toLowerCase(Locale.ROOT);

        if (token.isBlank() || isIgnoredToken(token)) {
            return cb.conjunction();
        }

        String keywordLike = "%" + token + "%";
        String normalizedToken = normalizeToken(token);

        Predicate textPredicate = cb.or(
                cb.like(cb.lower(root.get("name")), keywordLike),
                cb.like(cb.lower(root.get("slug")), keywordLike),
                cb.like(cb.lower(root.get("description")), keywordLike),
                cb.like(cb.lower(root.get("material")), keywordLike),
                cb.like(cb.lower(root.get("category").get("name")), keywordLike),
                cb.like(cb.lower(root.get("category").get("slug")), keywordLike),
                cb.like(cb.lower(root.get("brand").get("name")), keywordLike),
                cb.like(cb.lower(root.get("brand").get("slug")), keywordLike),
                cb.like(cb.lower(root.get("sport").get("name")), keywordLike),
                cb.like(cb.lower(root.get("sport").get("slug")), keywordLike),
                hasVariantKeyword(root, query, cb, keywordLike)
        );

        Predicate genderPredicate = buildGenderKeywordPredicate(root, cb, normalizedToken);
        if (genderPredicate == null) {
            return textPredicate;
        }

        return cb.or(textPredicate, genderPredicate);
    }

    private static Predicate buildGenderKeywordPredicate(Root<Product> root,
                                                         CriteriaBuilder cb,
                                                         String normalizedToken) {
        if (Set.of("nam", "male", "men", "man").contains(normalizedToken)) {
            return cb.equal(root.get("gender"), Gender.MALE);
        }

        if (Set.of("nu", "female", "women", "woman").contains(normalizedToken)) {
            return cb.equal(root.get("gender"), Gender.FEMALE);
        }

        if (Set.of("unisex", "uni", "both", "all").contains(normalizedToken)) {
            return cb.equal(root.get("gender"), Gender.UNISEX);
        }

        return null;
    }

    private static Predicate hasVariantKeyword(Root<Product> root,
                                               CriteriaQuery<?> query,
                                               CriteriaBuilder cb,
                                               String keywordLike) {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<ProductVariant> variantRoot = subquery.from(ProductVariant.class);

        subquery.select(variantRoot.get("id"));
        subquery.where(
                cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                cb.or(
                        cb.like(cb.lower(variantRoot.get("size")), keywordLike),
                        cb.like(cb.lower(variantRoot.get("color")), keywordLike),
                        cb.like(cb.lower(variantRoot.get("sku")), keywordLike)
                )
        );

        return cb.exists(subquery);
    }

    private static String normalizeToken(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return null;
            }

            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> hasCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) {
                return null;
            }

            return root.get("category").get("id").in(categoryIds);
        };
    }

    public static Specification<Product> hasCategoryGroup(String categoryGroup) {
        return (root, query, cb) -> {
            if (categoryGroup == null || categoryGroup.trim().isEmpty()) {
                return null;
            }

            String group = categoryGroup.trim().toLowerCase(Locale.ROOT);
            var categoryName = cb.lower(root.get("category").get("name"));
            var categorySlug = cb.lower(root.get("category").get("slug"));

            return switch (group) {
                case "shoes", "shoe", "giay", "giày" -> cb.or(
                        cb.equal(categoryName, "giày"),
                        cb.equal(categoryName, "giay"),
                        cb.like(categoryName, "giày %"),
                        cb.like(categoryName, "giay %"),
                        cb.equal(categorySlug, "giay"),
                        cb.like(categorySlug, "giay-%"),
                        cb.like(categorySlug, "giay_%")
                );
                case "apparel", "clothing", "quan-ao", "quanao", "quần áo" -> cb.or(
                        cb.equal(categoryName, "áo"),
                        cb.equal(categoryName, "ao"),
                        cb.like(categoryName, "áo %"),
                        cb.like(categoryName, "ao %"),
                        cb.equal(categorySlug, "ao"),
                        cb.like(categorySlug, "ao-%"),
                        cb.like(categorySlug, "ao_%"),
                        cb.equal(categoryName, "quần"),
                        cb.equal(categoryName, "quan"),
                        cb.like(categoryName, "quần %"),
                        cb.like(categoryName, "quan %"),
                        cb.equal(categorySlug, "quan"),
                        cb.like(categorySlug, "quan-%"),
                        cb.like(categorySlug, "quan_%")
                );
                case "accessories", "accessory", "phu-kien", "phukien", "phụ kiện" -> cb.or(
                        cb.equal(categoryName, "phụ kiện"),
                        cb.equal(categoryName, "phu kien"),
                        cb.like(categoryName, "phụ kiện %"),
                        cb.like(categoryName, "phu kien %"),
                        cb.equal(categorySlug, "phu-kien"),
                        cb.equal(categorySlug, "phukien"),
                        cb.like(categorySlug, "phu-kien-%"),
                        cb.like(categorySlug, "phukien-%"),
                        cb.like(categoryName, "túi%"),
                        cb.like(categoryName, "tui%"),
                        cb.like(categoryName, "mũ%"),
                        cb.like(categoryName, "mu%"),
                        cb.like(categoryName, "balo%"),
                        cb.like(categoryName, "ba lô%"),
                        cb.like(categoryName, "tất%"),
                        cb.like(categoryName, "tat%"),
                        cb.like(categorySlug, "tui%"),
                        cb.like(categorySlug, "mu%"),
                        cb.like(categorySlug, "balo%"),
                        cb.like(categorySlug, "tat%")
                );
                default -> null;
            };
        };
    }

    public static Specification<Product> hasBrandId(Long brandId) {
        return (root, query, cb) -> {
            if (brandId == null) {
                return null;
            }

            return cb.equal(root.get("brand").get("id"), brandId);
        };
    }

    public static Specification<Product> hasSportId(Long sportId) {
        return (root, query, cb) -> {
            if (sportId == null) {
                return null;
            }

            return cb.equal(root.get("sport").get("id"), sportId);
        };
    }

    public static Specification<Product> hasGender(Gender gender) {
        return (root, query, cb) -> {
            if (gender == null) {
                return null;
            }

            return cb.equal(root.get("gender"), gender);
        };
    }

    public static Specification<Product> hasActiveStatus(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return null;
            }

            return cb.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return null;
            }

            Subquery<Long> subquery = query.subquery(Long.class);
            var variantRoot = subquery.from(ProductVariant.class);

            subquery.select(variantRoot.get("product").get("id"));

            if (minPrice != null && maxPrice != null) {
                subquery.where(
                        cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                        cb.between(variantRoot.get("price"), minPrice, maxPrice)
                );
            } else if (minPrice != null) {
                subquery.where(
                        cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                        cb.greaterThanOrEqualTo(variantRoot.get("price"), minPrice)
                );
            } else {
                subquery.where(
                        cb.equal(variantRoot.get("product").get("id"), root.get("id")),
                        cb.lessThanOrEqualTo(variantRoot.get("price"), maxPrice)
                );
            }

            return cb.exists(subquery);
        };
    }
}
