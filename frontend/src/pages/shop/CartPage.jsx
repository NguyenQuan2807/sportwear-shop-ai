import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteCartItemApi,
  getCartApi,
  updateCartItemApi,
} from "../../services/cartService";
import { formatCurrency } from "../../utils/formatCurrency";
import CartItemCard from "../../components/product/CartItemCard";

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
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="h-28 w-28 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-1/4 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 text-white shadow-2xl">
        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Your Cart
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Giỏ hàng của bạn
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Kiểm tra sản phẩm, cập nhật số lượng và hoàn tất đơn hàng với trải
              nghiệm mua sắm hiện đại, tối ưu cho mọi thiết bị.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                {items.length} dòng sản phẩm
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                {totalQuantity} sản phẩm
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickStat label="Mặt hàng" value={items.length} />
              <QuickStat label="Số lượng" value={totalQuantity} />
              <QuickStat label="Tổng tiền" value={formatCurrency(totalAmount)} />
            </div>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <section className="rounded-[32px] border border-slate-200/70 bg-white px-6 py-12 text-center shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CartIcon />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Hãy khám phá thêm các sản phẩm thể thao nổi bật và thêm vào giỏ để
            bắt đầu trải nghiệm mua sắm.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Tiếp tục mua sắm
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Về trang chủ
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
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
          </section>

          <aside className="space-y-4">
            <div className="sticky top-28 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Order Summary
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-6 space-y-4 rounded-[24px] bg-slate-50 p-5">
                <SummaryRow label="Dòng sản phẩm" value={items.length} />
                <SummaryRow label="Tổng số lượng" value={totalQuantity} />
                <SummaryRow
                  label="Tạm tính"
                  value={formatCurrency(totalAmount)}
                />
              </div>

              <div className="mt-5 rounded-[24px] border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
                  Checkout Ready
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ở bước tiếp theo bạn sẽ nhập thông tin nhận hàng và chọn phương
                  thức thanh toán như COD, VNPay, MoMo.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                <span className="text-base font-semibold text-slate-600">
                  Tổng cộng
                </span>
                <span className="text-2xl font-black tracking-tight text-red-500">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoCheckout}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Tiến hành thanh toán
              </button>

              <Link
                to="/products"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
      {label}
    </p>
    <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-9 w-9"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3.75h1.386c.51 0 .955.343 1.084.836L5.64 9m0 0h12.96c.694 0 1.29-.49 1.423-1.171l1.2-6A1.125 1.125 0 0 0 20.121.5H5.094M5.64 9l-1.2 6.6A1.125 1.125 0 0 0 5.55 16.875h12.075M9 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm9 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

export default CartPage;