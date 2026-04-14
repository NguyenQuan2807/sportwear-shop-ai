import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getWishlistItems,
  isInWishlist,
  toggleWishlistItem,
} from "../utils/wishlistStorage";

export default function useWishlist(product = null) {
  const [wishlistItems, setWishlistItems] = useState(() => getWishlistItems());

  const refreshWishlist = useCallback(() => {
    setWishlistItems(getWishlistItems());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.addEventListener("storage", refreshWishlist);
    window.addEventListener("wishlist:updated", refreshWishlist);

    return () => {
      window.removeEventListener("storage", refreshWishlist);
      window.removeEventListener("wishlist:updated", refreshWishlist);
    };
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(
    (nextProduct = product) => {
      const updated = toggleWishlistItem(nextProduct);
      setWishlistItems(updated);
      return updated;
    },
    [product]
  );

  const isWishlisted = useMemo(() => {
    if (!product?.id) return false;
    return isInWishlist(product.id);
  }, [product, wishlistItems]);

  return {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isWishlisted,
    toggleWishlist,
    refreshWishlist,
  };
}
