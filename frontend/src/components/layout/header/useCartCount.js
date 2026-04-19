import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCartApi } from "../../../services/cartService";
import { CART_UPDATED_EVENT } from "../../../utils/cartEvents";

const useCartCount = (user) => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await getCartApi();
      const items = Array.isArray(response?.data?.items) ? response.data.items : [];
      const totalQuantity = items.reduce(
        (sum, item) => sum + Number(item?.quantity || 0),
        0
      );
      setCartCount(totalQuantity);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount, location.pathname, location.search]);

  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, [fetchCartCount]);

  return cartCount;
};

export default useCartCount;
