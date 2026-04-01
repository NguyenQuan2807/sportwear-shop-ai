package com.nguyenhuuquan.sportwearshop.specification;

import com.nguyenhuuquan.sportwearshop.common.enums.Gender;
import com.nguyenhuuquan.sportwearshop.entity.Product;
import com.nguyenhuuquan.sportwearshop.entity.ProductVariant;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

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