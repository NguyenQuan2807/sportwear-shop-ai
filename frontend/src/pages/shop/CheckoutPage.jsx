import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartApi } from "../../services/cartService";
import { createOrderApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    shippingAddress: "",
    receiverName: "",
    receiverPhone: "",
    note: "",
    paymentMethod: "COD",
  });

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

  const items = cart?.items || [];
  const subTotalAmount = cart?.subTotalAmount || 0;
  const discountAmount = cart?.discountAmount || 0;
  const totalAmount = cart?.totalAmount || 0;
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectPayment = (method) => {
    if (method !== "COD") return;

    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!cart?.items || cart.items.length === 0) {
      setErrorMessage("Giỏ hàng đang trống");
      return;
    }

    if (formData.paymentMethod !== "COD") {
      setErrorMessage(
        "VNPay và MoMo đang được chuẩn bị giao diện. Hiện tại bạn vui lòng dùng COD."
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createOrderApi(formData);

      setSuccessMessage("Đặt hàng thành công");

      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tạo đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
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
  }

  if (items.length === 0) {
    return (
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
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 text-white shadow-2xl">
        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Checkout
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Hoàn tất đơn hàng của bạn
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Điền thông tin nhận hàng, kiểm tra lại sản phẩm và chọn phương thức
              thanh toán phù hợp trước khi xác nhận đơn hàng.
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
              <QuickStat label="Tạm tính" value={formatCurrency(subTotalAmount)} />
              <QuickStat label="Giảm giá" value={formatCurrency(discountAmount)} />
              <QuickStat label="Tổng thanh toán" value={formatCurrency(totalAmount)} />
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <form
            onSubmit={handleSubmitOrder}
            className="space-y-6 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Shipping Information
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Thông tin nhận hàng
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Vui lòng nhập chính xác thông tin để đơn hàng được xử lý nhanh hơn.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Tên người nhận"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                placeholder="Nhập tên người nhận"
                required
              />

              <InputField
                label="Số điện thoại"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />

              <InputField
                label="Địa chỉ giao hàng"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú cho đơn hàng"
                  rows="4"
                  className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Payment Method
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Chọn phương thức thanh toán
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Giao diện đã được chuẩn bị sẵn cho COD, VNPay và MoMo. Hiện tại luồng
                đặt hàng thật đang chạy với COD.
              </p>

              <div className="mt-5 grid gap-4">
                <PaymentMethodCard
                  title="Thanh toán khi nhận hàng (COD)"
                  description="Thanh toán trực tiếp khi đơn hàng được giao đến bạn."
                  active={formData.paymentMethod === "COD"}
                  disabled={false}
                  icon={<CashIcon />}
                  badge="Available"
                  onClick={() => handleSelectPayment("COD")}
                />

                <PaymentMethodCard
                  title="VNPay"
                  description="Đã chừa sẵn UI để tích hợp redirect thanh toán VNPay ở bước tiếp theo."
                  active={formData.paymentMethod === "VNPAY"}
                  disabled
                  icon={<VnpayIcon />}
                  badge="Coming Soon"
                  onClick={() => handleSelectPayment("VNPAY")}
                />

                <PaymentMethodCard
                  title="MoMo"
                  description="Đã chừa sẵn UI để tích hợp thanh toán MoMo khi backend sẵn sàng."
                  active={formData.paymentMethod === "MOMO"}
                  disabled
                  icon={<MomoIcon />}
                  badge="Coming Soon"
                  onClick={() => handleSelectPayment("MOMO")}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>

              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="sticky top-28 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Order Summary
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Đơn hàng của bạn
            </h2>

            {discountAmount > 0 && (
              <div className="mt-5 rounded-[24px] border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-white px-4 py-4 text-sm text-red-500">
                Đơn hàng của bạn đang được áp dụng khuyến mãi.
              </div>
            )}

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                        {item.productName}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                          Size {item.size}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                          {item.color}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                          x{item.quantity}
                        </span>
                      </div>

                      <div className="mt-3">
                        {item.onPromotion ? (
                          <>
                            <p className="text-xs text-slate-400 line-through">
                              {formatCurrency((item.originalPrice || 0) * item.quantity)}
                            </p>
                            <p className="text-base font-black tracking-tight text-red-500">
                              {formatCurrency(item.totalPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-base font-black tracking-tight text-slate-900">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        )}

                        {item.promotionName && (
                          <p className="mt-1 text-xs font-semibold text-red-500">
                            {item.flashSale ? "Flash Sale: " : "Khuyến mãi: "}
                            {item.promotionName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] bg-slate-50 p-5">
              <SummaryRow label="Dòng sản phẩm" value={items.length} />
              <SummaryRow label="Tổng số lượng" value={totalQuantity} />
              <SummaryRow
                label="Tạm tính"
                value={formatCurrency(subTotalAmount)}
              />
              <SummaryRow
                label="Giảm giá"
                value={`- ${formatCurrency(discountAmount)}`}
                highlight="danger"
              />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-base font-semibold text-slate-600">
                Tổng cộng
              </span>
              <span className="text-2xl font-black tracking-tight text-red-500">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
    />
  </div>
);

const PaymentMethodCard = ({
  title,
  description,
  active,
  disabled = false,
  icon,
  badge,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full rounded-[24px] border p-5 text-left transition ${
      active
        ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200"
        : disabled
        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            active
              ? "bg-white/10 text-white"
              : disabled
              ? "bg-white text-slate-400"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-base font-black tracking-tight`}>
              {title}
            </h4>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                active
                  ? "bg-white/10 text-white"
                  : disabled
                  ? "bg-white text-slate-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {badge}
            </span>
          </div>
          <p
            className={`mt-2 text-sm leading-6 ${
              active ? "text-white/70" : disabled ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className={`mt-1 h-5 w-5 rounded-full border-2 ${
          active
            ? "border-white bg-white"
            : disabled
            ? "border-slate-300"
            : "border-slate-300"
        }`}
      >
        {active && <div className="m-[3px] h-2.5 w-2.5 rounded-full bg-slate-900" />}
      </div>
    </div>
  </button>
);

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
      {label}
    </p>
    <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
  </div>
);

const SummaryRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span
      className={`font-semibold ${
        highlight === "danger" ? "text-red-500" : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

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

const CashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5v7.5H2.25v-7.5Zm3.75 2.25h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008ZM18 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
    />
  </svg>
);

const VnpayIcon = () => (
  <span className="text-sm font-black tracking-tight">VNP</span>
);

const MomoIcon = () => (
  <span className="text-sm font-black tracking-tight">MM</span>
);

export default CheckoutPage;