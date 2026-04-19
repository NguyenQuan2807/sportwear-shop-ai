import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteCartItemApi,
  getCartApi,
  updateCartItemApi,
} from "../../services/cartService";
import { formatCurrency } from "../../utils/formatCurrency";
import CartItemCard from "../../components/product/CartItemCard";
import { dispatchCartUpdated } from "../../utils/cartEvents";

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getCartApi();
      setCart(response.data);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải giỏ hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      setLoadingItemId(cartItemId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await updateCartItemApi(cartItemId, {
        quantity: newQuantity,
      });

      setCart(response.data);
      dispatchCartUpdated();
      setSuccessMessage("Cập nhật giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể cập nhật số lượng";
      setErrorMessage(backendMessage);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = (item) => {
    handleUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;
    handleUpdateQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = async (cartItemId) => {
    try {
      setDeletingItemId(cartItemId);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCartItemApi(cartItemId);
      await fetchCart();
      dispatchCartUpdated();
      setSuccessMessage("Xóa sản phẩm khỏi giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleGoCheckout = () => {
    navigate("/checkout");
  };

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black/50">
            <BagIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-black/55">
            Hãy thêm vài sản phẩm vào giỏ để tiếp tục mua sắm.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-4 text-sm font-semibold text-black"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-12">
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-black">Giỏ hàng</h1>
              <p className="mt-2 text-sm text-black/55">
                {items.length} dòng sản phẩm · {totalQuantity} sản phẩm
              </p>
            </div>

            <Link
              to="/products"
              className="hidden text-sm font-semibold text-black underline underline-offset-4 xl:inline-flex"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {successMessage ? (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-7">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                loadingItemId={loadingItemId}
                deletingItemId={deletingItemId}
              />
            ))}
          </div>

        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5">
            <h2 className="text-4xl font-semibold tracking-tight text-black">Sơ lược</h2>

            <div className="mt-8 space-y-5 border-b border-black/10 pb-6 text-[17px]">
              <SummaryRow label="Tổng tạm tính" value={formatCurrency(totalAmount)} />
              <SummaryRow label="Phí giao hàng" value="Free" />
            </div>

            <div className="flex items-center justify-between gap-4 py-6 text-[22px] font-semibold text-black">
              <span>Tổng giá</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            <button
              type="button"
              onClick={handleGoCheckout}
              className="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-5 text-lg font-semibold text-white transition hover:opacity-90"
            >
              Đặt hàng ngay
            </button>

            <Link
              to="/products"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-black/15 px-6 py-5 text-base font-semibold text-black transition hover:border-black"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-black/75">{label}</span>
    <span className="font-medium text-black">{value}</span>
  </div>
);

const CartPageSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-12">
      <div>
        <div className="h-10 w-24 animate-pulse rounded bg-black/6" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-black/6" />
        <div className="mt-8 space-y-7">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border-b border-black/10 pb-7">
              <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div className="aspect-square animate-pulse rounded bg-black/6" />
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-7 w-52 animate-pulse rounded bg-black/6" />
                      <div className="h-5 w-40 animate-pulse rounded bg-black/6" />
                      <div className="h-5 w-32 animate-pulse rounded bg-black/6" />
                    </div>
                    <div className="h-7 w-28 animate-pulse rounded bg-black/6" />
                  </div>
                  <div className="h-12 w-44 animate-pulse rounded-full bg-black/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5">
        <div className="h-10 w-40 animate-pulse rounded bg-black/6" />
        <div className="mt-8 space-y-5">
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
        </div>
        <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-black/6" />
      </div>
    </div>
  </div>
);

const BagIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M6.75 8.25V7a5.25 5.25 0 0 1 10.5 0v1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 8.25h15l-1.2 10.8a2.25 2.25 0 0 1-2.236 2.002H7.936A2.25 2.25 0 0 1 5.7 19.05L4.5 8.25Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TruckIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 6.75h11.25v9.75H3z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.25 9.75h3.879c.52 0 1.012.24 1.333.65l1.787 2.278c.177.226.273.505.273.792v3.03h-7.272" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.125 18.75a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm13.5 0a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CartPage;
