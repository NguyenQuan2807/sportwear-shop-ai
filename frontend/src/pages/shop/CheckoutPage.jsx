import { Link } from "react-router-dom";
import CheckoutForm from "../../features/checkout/CheckoutForm";
import CheckoutHero from "../../features/checkout/CheckoutHero";
import OrderSummary from "../../features/checkout/OrderSummary";
import { useCheckout } from "../../features/checkout/useCheckout";

const CheckoutIcon = () => (
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
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-2.25 0h13.5A2.25 2.25 0 0 1 21 12.75v6A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75v-6A2.25 2.25 0 0 1 5.25 10.5Z"
    />
  </svg>
);

const CheckoutLoading = () => (
  <div className="space-y-6">
    <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EmptyCartState = () => (
  <section className="rounded-[32px] border border-slate-200/70 bg-white px-6 py-12 text-center shadow-lg shadow-slate-200/50 sm:px-8">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <CheckoutIcon />
    </div>

    <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
      Không thể thanh toán vì giỏ hàng đang trống
    </h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
      Hãy thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
    </p>

    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        to="/products"
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Xem sản phẩm
      </Link>

      <Link
        to="/cart"
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
      >
        Quay lại giỏ hàng
      </Link>
    </div>
  </section>
);

const CheckoutPage = () => {
  const {
    items,
    loading,
    submitting,
    errorMessage,
    successMessage,
    formData,
    totalQuantity,
    subTotalAmount,
    discountAmount,
    totalAmount,
    handleChange,
    handleSelectPayment,
    handleSubmitOrder,
  } = useCheckout();

  if (loading) {
    return <CheckoutLoading />;
  }

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="space-y-8 pb-8">
      <CheckoutHero
        itemCount={items.length}
        totalQuantity={totalQuantity}
        subTotalAmount={subTotalAmount}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
      />

      {successMessage ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <CheckoutForm
          formData={formData}
          submitting={submitting}
          onChange={handleChange}
          onSelectPayment={handleSelectPayment}
          onSubmit={handleSubmitOrder}
        />

        <OrderSummary
          items={items}
          totalQuantity={totalQuantity}
          subTotalAmount={subTotalAmount}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
