const STORAGE_KEY = "sportwear_shop_wishlist";

function dispatchWishlistUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlist:updated"));
  }
}

export function getWishlistItems() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Không thể đọc wishlist từ localStorage", error);
    return [];
  }
}

export function saveWishlistItems(items) {
  if (typeof window === "undefined") return [];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    dispatchWishlistUpdated();
    return items;
  } catch (error) {
    console.error("Không thể lưu wishlist vào localStorage", error);
    return items;
  }
}

export function isInWishlist(productId) {
  return getWishlistItems().some((item) => String(item.id) === String(productId));
}

export function normalizeWishlistItem(product) {
  if (!product?.id) return null;

  return {
    id: product.id,
    name: product.name || "Sản phẩm",
    thumbnailUrl: product.thumbnailUrl || product.imageUrl || "",
    brandName: product.brandName || "",
    sportName: product.sportName || "",
    categoryName: product.categoryName || "",
    minPrice: product.minPrice ?? product.price ?? null,
    maxPrice: product.maxPrice ?? product.price ?? null,
    originalMinPrice: product.originalMinPrice ?? null,
    originalMaxPrice: product.originalMaxPrice ?? null,
    saleMinPrice: product.saleMinPrice ?? null,
    saleMaxPrice: product.saleMaxPrice ?? null,
    onPromotion: Boolean(product.onPromotion),
    flashSale: Boolean(product.flashSale),
    inStock: product.inStock !== false,
    maxDiscountPercent: product.maxDiscountPercent ?? 0,
    addedAt: new Date().toISOString(),
  };
}

export function toggleWishlistItem(product) {
  const normalized = normalizeWishlistItem(product);
  if (!normalized) return getWishlistItems();

  const currentItems = getWishlistItems();
  const exists = currentItems.some(
    (item) => String(item.id) === String(normalized.id)
  );

  if (exists) {
    return saveWishlistItems(
      currentItems.filter((item) => String(item.id) !== String(normalized.id))
    );
  }

  return saveWishlistItems([normalized, ...currentItems]);
}
