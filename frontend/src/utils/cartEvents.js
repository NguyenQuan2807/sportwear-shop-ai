export const CART_UPDATED_EVENT = "cart-updated";

export const dispatchCartUpdated = () => {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};
