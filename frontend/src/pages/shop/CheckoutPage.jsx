import { Link } from "react-router-dom";
import CheckoutForm from "../../features/checkout/CheckoutForm";
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
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
      <div className="space-y-10">
        {Array.from({ length: 3 }).map((_, blockIndex) => (
          <div key={blockIndex} className="border-b border-black/10 pb-10">
            <div className="h-10 w-40 animate-pulse rounded bg-black/6" />
            <div className="mt-6 grid gap-4">
              {Array.from({ length: 4 }).map((__, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-black/6" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5">
        <div className="h-10 w-40 animate-pulse rounded bg-black/6" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-5 animate-pulse rounded bg-black/6" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EmptyCartState = () => (
  <section className="mx-auto max-w-4xl rounded-[32px] border border-black/10 bg-white px-6 py-12 text-center shadow-sm sm:px-8">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/35">
      <CheckoutIcon />
    </div>

    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-black">
      Không thể thanh toán vì giỏ hàng đang trống
    </h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
      Hãy thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
    </p>

    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        to="/products"
        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Xem sản phẩm
      </Link>

      <Link
        to="/cart"
        className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:border-black"
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
    addresses,
    selectedAddressId,
    isAddressModalOpen,
    totalQuantity,
    subTotalAmount,
    discountAmount,
    shippingFee,
    totalAmount,
    handleChange,
    handleSelectPayment,
    handleOpenAddressModal,
    handleCloseAddressModal,
    handleChooseAddress,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleToggleSaveAddress,
    handleSubmitOrder,
  } = useCheckout();

  if (loading) {
    return <CheckoutLoading />;
  }

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
      {successMessage ? (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 shadow-sm">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
        <CheckoutForm
          formData={formData}
          submitting={submitting}
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          isAddressModalOpen={isAddressModalOpen}
          onChange={handleChange}
          onSelectPayment={handleSelectPayment}
          onOpenAddressModal={handleOpenAddressModal}
          onCloseAddressModal={handleCloseAddressModal}
          onChooseAddress={handleChooseAddress}
          onProvinceChange={handleProvinceChange}
          onDistrictChange={handleDistrictChange}
          onWardChange={handleWardChange}
          onToggleSaveAddress={handleToggleSaveAddress}
          onSubmit={handleSubmitOrder}
        />

        <OrderSummary
          items={items}
          totalQuantity={totalQuantity}
          subTotalAmount={subTotalAmount}
          discountAmount={discountAmount}
          shippingFee={shippingFee}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
