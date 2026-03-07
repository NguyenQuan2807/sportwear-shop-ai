INSERT IGNORE INTO roles (name, created_at, updated_at)
VALUES ('ADMIN', NOW(), NOW()),
       ('USER', NOW(), NOW());

INSERT IGNORE INTO sports (name, slug, description, icon_url, is_active, created_at, updated_at)
VALUES ('Bóng đá', 'bong-da', 'Sản phẩm dành cho bóng đá', NULL, true, NOW(), NOW()),
       ('Cầu lông', 'cau-long', 'Sản phẩm dành cho cầu lông', NULL, true, NOW(), NOW());

INSERT IGNORE INTO categories (name, slug, description, is_active, created_at, updated_at)
VALUES ('Áo thể thao', 'ao-the-thao', 'Danh mục áo thể thao', true, NOW(), NOW()),
       ('Giày thể thao', 'giay-the-thao', 'Danh mục giày thể thao', true, NOW(), NOW());

INSERT IGNORE INTO brands (name, slug, description, logo_url, is_active, created_at, updated_at)
VALUES ('Nike', 'nike', 'Thương hiệu Nike', NULL, true, NOW(), NOW()),
       ('Adidas', 'adidas', 'Thương hiệu Adidas', NULL, true, NOW(), NOW());

INSERT IGNORE INTO products (name, slug, description, category_id, brand_id, sport_id, gender, material, thumbnail_url, is_active, created_at, updated_at)
VALUES ('Áo bóng đá Nike Academy', 'ao-bong-da-nike-academy', 'Áo bóng đá chất liệu thoáng khí', 1, 1, 1, 'MALE', 'Polyester', NULL, true, NOW(), NOW()),
       ('Giày thể thao Adidas Run X', 'giay-the-thao-adidas-run-x', 'Giày thể thao chạy bộ êm ái', 2, 2, 1, 'UNISEX', 'Mesh', NULL, true, NOW(), NOW());

INSERT IGNORE INTO product_variants (product_id, size, color, price, stock_quantity, sku, created_at, updated_at)
VALUES (1, 'M', 'Đỏ', 350000, 10, 'NIKE-ACADEMY-M-RED', NOW(), NOW()),
       (1, 'L', 'Đỏ', 350000, 8, 'NIKE-ACADEMY-L-RED', NOW(), NOW()),
       (2, '42', 'Trắng', 1200000, 5, 'ADIDAS-RUNX-42-WHITE', NOW(), NOW());

INSERT IGNORE INTO product_images (product_id, image_url, is_thumbnail, sort_order, created_at, updated_at)
VALUES (1, 'https://example.com/nike-shirt-1.jpg', true, 1, NOW(), NOW()),
       (1, 'https://example.com/nike-shirt-2.jpg', false, 2, NOW(), NOW()),
       (2, 'https://example.com/adidas-shoe-1.jpg', true, 1, NOW(), NOW());