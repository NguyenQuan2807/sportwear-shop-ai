import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCartApi } from "../../../services/cartService";

const useCartCount = (user) => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
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
    };

    fetchCartCount();
  }, [user, location.pathname, location.search]);

  return cartCount;
};

export default useCartCount;