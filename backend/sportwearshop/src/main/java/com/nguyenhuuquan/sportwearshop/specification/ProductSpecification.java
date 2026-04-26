package com.nguyenhuuquan.sportwearshop.specification;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class ProductSpecification {

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

            String keywordLike = "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("name")), keywordLike),
                    cb.like(cb.lower(root.get("slug")), keywordLike),
                    cb.like(cb.lower(root.get("description")), keywordLike),
                    cb.like(cb.lower(root.get("material")), keywordLike),
                    cb.like(cb.lower(root.get("category").get("name")), keywordLike),
                    cb.like(cb.lower(root.get("brand").get("name")), keywordLike),
                    cb.like(cb.lower(root.get("sport").get("name")), keywordLike)
            );
        };
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

            String group = categoryGroup.trim().toLowerCase();
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
