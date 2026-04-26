import { Link } from "react-router-dom";
import CheckoutForm from "../../features/checkout/CheckoutForm";
import OrderSummary from "../../features/checkout/OrderSummary";
import BankQrPaymentModal from "../../components/checkout/BankQrPaymentModal";
import { useCheckout } from "../../features/checkout/useCheckout";

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
    isQrModalOpen,
    qrSession,
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
    handleQrModalSuccess,
    handleQrModalFailure,
  } = useCheckout();

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8">Đang tải...</div>;
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl rounded-[32px] border border-black/10 bg-white px-6 py-12 text-center shadow-sm sm:px-8">
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-black">Không thể thanh toán vì giỏ hàng đang trống</h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/products" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white">Xem sản phẩm</Link>
          <Link to="/cart" className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3.5 text-sm font-semibold text-black">Quay lại giỏ hàng</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
      {successMessage ? <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 shadow-sm">{successMessage}</div> : null}
      {errorMessage ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">{errorMessage}</div> : null}

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

      <BankQrPaymentModal open={isQrModalOpen} session={qrSession} onSuccess={handleQrModalSuccess} onFailed={handleQrModalFailure} />
    </div>
  );
};

export default CheckoutPage;
