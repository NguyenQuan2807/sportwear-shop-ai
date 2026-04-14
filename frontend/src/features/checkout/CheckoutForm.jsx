import { Link } from "react-router-dom";

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
            <h4 className="text-base font-black tracking-tight">{title}</h4>
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
          active ? "border-white bg-white" : "border-slate-300"
        }`}
      >
        {active ? (
          <div className="m-[3px] h-2.5 w-2.5 rounded-full bg-slate-900" />
        ) : null}
      </div>
    </div>
  </button>
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

const CheckoutForm = ({
  formData,
  submitting,
  onChange,
  onSelectPayment,
  onSubmit,
}) => {
  return (
    <section>
      <form
        onSubmit={onSubmit}
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
            onChange={onChange}
            placeholder="Nhập tên người nhận"
            required
          />

          <InputField
            label="Số điện thoại"
            name="receiverPhone"
            value={formData.receiverPhone}
            onChange={onChange}
            placeholder="Nhập số điện thoại"
            required
          />

          <InputField
            label="Địa chỉ giao hàng"
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={onChange}
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
              onChange={onChange}
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
            Giao diện đã được chuẩn bị sẵn cho COD, VNPay và MoMo. Hiện tại luồng đặt
            hàng thật đang chạy với COD.
          </p>

          <div className="mt-5 grid gap-4">
            <PaymentMethodCard
              title="Thanh toán khi nhận hàng (COD)"
              description="Thanh toán trực tiếp khi đơn hàng được giao đến bạn."
              active={formData.paymentMethod === "COD"}
              disabled={false}
              icon={<CashIcon />}
              badge="Available"
              onClick={() => onSelectPayment("COD")}
            />

            <PaymentMethodCard
              title="VNPay"
              description="Đã chừa sẵn UI để tích hợp redirect thanh toán VNPay ở bước tiếp theo."
              active={formData.paymentMethod === "VNPAY"}
              disabled
              icon={<VnpayIcon />}
              badge="Coming Soon"
              onClick={() => onSelectPayment("VNPAY")}
            />

            <PaymentMethodCard
              title="MoMo"
              description="Đã chừa sẵn UI để tích hợp thanh toán MoMo khi backend sẵn sàng."
              active={formData.paymentMethod === "MOMO"}
              disabled
              icon={<MomoIcon />}
              badge="Coming Soon"
              onClick={() => onSelectPayment("MOMO")}
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
  );
};

export default CheckoutForm;
