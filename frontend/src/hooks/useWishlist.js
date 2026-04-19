import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import {
  addWishlistItemApi,
  deleteWishlistItemApi,
  getWishlistApi,
} from "../services/wishlistService";

let activeIdentity = null;
let sharedWishlistItems = [];
let hasLoadedWishlist = false;
let pendingWishlistRequest = null;
const wishlistListeners = new Set();

const emitWishlistChange = () => {
  wishlistListeners.forEach((listener) => listener(sharedWishlistItems));
};

const resolveIdentity = (user) => user?.id || user?.email || user?.username || null;

const resetWishlistStore = (identity) => {
  activeIdentity = identity;
  sharedWishlistItems = [];
  hasLoadedWishlist = false;
  pendingWishlistRequest = null;
};

const syncWishlistFromResponse = (response) => {
  sharedWishlistItems = Array.isArray(response?.data?.items)
    ? response.data.items
    : Array.isArray(response?.items)
    ? response.items
    : [];
  hasLoadedWishlist = true;
  emitWishlistChange();
  return sharedWishlistItems;
};

const ensureWishlistLoaded = async (user) => {
  if (!user) {
    sharedWishlistItems = [];
    hasLoadedWishlist = true;
    emitWishlistChange();
    return [];
  }

  if (hasLoadedWishlist) {
    return sharedWishlistItems;
  }

  if (!pendingWishlistRequest) {
    pendingWishlistRequest = getWishlistApi()
      .then((response) => syncWishlistFromResponse(response))
      .catch(() => {
        sharedWishlistItems = [];
        hasLoadedWishlist = true;
        emitWishlistChange();
        return [];
      })
      .finally(() => {
        pendingWishlistRequest = null;
      });
  }

  return pendingWishlistRequest;
};

const useWishlist = (product = null) => {
  const { user } = useAuth();
  const identity = useMemo(() => resolveIdentity(user), [user]);
  const [wishlistItems, setWishlistItems] = useState(sharedWishlistItems);

  useEffect(() => {
    const listener = (items) => setWishlistItems(items);
    wishlistListeners.add(listener);

    if (activeIdentity !== identity) {
      resetWishlistStore(identity);
      setWishlistItems([]);
    }

    ensureWishlistLoaded(user).then(setWishlistItems);

    return () => {
      wishlistListeners.delete(listener);
    };
  }, [identity, user]);

  const isWishlisted = product
    ? wishlistItems.some((item) => item.id === product.id)
    : false;

  const addToWishlist = async (productItem) => {
    if (!productItem?.id) return;
    if (!user) {
      window.location.assign("/login");
      return;
    }

    const response = await addWishlistItemApi({ productId: productItem.id });
    syncWishlistFromResponse(response);
  };

  const removeFromWishlist = async (productId) => {
    if (!productId || !user) return;
    const response = await deleteWishlistItemApi(productId);
    syncWishlistFromResponse(response);
  };

  const toggleWishlist = async (productItem) => {
    if (!productItem?.id) return;

    if (!user) {
      window.location.assign("/login");
      return;
    }

    if (wishlistItems.some((item) => item.id === productItem.id)) {
      await removeFromWishlist(productItem.id);
      return;
    }

    await addToWishlist(productItem);
  };

  const clearWishlist = () => {
    sharedWishlistItems = [];
    hasLoadedWishlist = false;
    emitWishlistChange();
  };

  return {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };
};

export default useWishlist;
