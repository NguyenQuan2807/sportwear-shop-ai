import { Link } from "react-router-dom";

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  helperText,
  type = "text",
  rightAdornment = null,
}) => (
  <div>
    {label ? <label className="mb-2 block text-sm font-medium text-black/55">{label}</label> : null}
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-14 w-full rounded-xl border border-black/20 bg-white px-4 text-[17px] text-black outline-none transition focus:border-black"
      />
      {rightAdornment ? (
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          {rightAdornment}
        </div>
      ) : null}
    </div>
    {helperText ? <p className="mt-2 text-sm text-black/45">{helperText}</p> : null}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-[32px] font-semibold tracking-tight text-black">{children}</h2>
);

const PaymentOption = ({ active, icon, title, subtitle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-5 text-left transition ${
      active ? "border-black shadow-[inset_0_0_0_1px_#000]" : "border-black/15 hover:border-black/35"
    }`}
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-black">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xl font-semibold text-black">{title}</div>
      <div className="mt-1 text-sm text-black/55">{subtitle}</div>
    </div>
  </button>
);

const CheckoutForm = ({
  formData,
  submitting,
  onChange,
  onToggleBilling,
  onSelectPayment,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="border-b border-black/10 pb-10">
        <SectionTitle>Giao hàng</SectionTitle>

        <div className="mt-7 space-y-6">
          <InputField
            label="Email *"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Nhập email"
            required
            type="email"
            helperText="Sau khi hoàn tất thanh toán, bạn sẽ nhận được email xác nhận."
          />

          <div>
            <p className="mb-4 text-[28px] font-medium tracking-tight text-black">
              Điền tên của bạn và địa chỉ nhận hàng
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                placeholder="Tên của bạn *"
                required
              />
              <InputField
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
                placeholder="Họ của bạn *"
                required
              />
            </div>
          </div>

          <InputField
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={onChange}
            placeholder="Địa chỉ nhận hàng *"
            required
          />

          <button
            type="button"
            className="text-[17px] font-medium text-black underline underline-offset-4"
          >
            Enter address manually
          </button>

          <InputField
            name="receiverPhone"
            value={formData.receiverPhone}
            onChange={onChange}
            placeholder="Số điện thoại *"
            required
            helperText="Người vận chuyển có thể liên hệ với bạn để xác nhận việc giao hàng."
          />

          {/* <label className="inline-flex items-center gap-3 text-[17px] text-black">
            <input
              type="checkbox"
              checked={Boolean(formData.billingSameAsShipping)}
              onChange={onToggleBilling}
              className="h-5 w-5 rounded border-black/20 text-black focus:ring-black"
            />
            <span>Billing matches shipping address</span>
          </label> */}
        </div>
      </section>

      {/* <section className="border-b border-black/10 pb-10">
        <SectionTitle>Shipping</SectionTitle>

        <div className="mt-7 space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-black px-5 py-5 text-left"
          >
            <div>
              <div className="text-xl font-semibold text-black">Standard Delivery</div>
              <div className="mt-1 text-sm text-black/55">Dự kiến giao trong 2-5 ngày làm việc.</div>
            </div>
            <div className="text-lg font-semibold text-black">Đã chọn</div>
          </button>
        </div>
      </section> */}

      <section className="space-y-6">
        <SectionTitle>Phương thức thanh toán</SectionTitle>

        {/* <div>
          <p className="mb-4 text-[28px] font-medium tracking-tight text-black">Have a promo code?</p>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="Promo"
              className="h-14 flex-1 rounded-xl border border-black/20 bg-white px-4 text-[17px] text-black outline-none transition focus:border-black"
            />
            <button
              type="button"
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/15 px-8 text-[17px] font-medium text-black transition hover:border-black/35"
            >
              Apply
            </button>
          </div>
          <p className="mt-2 text-sm text-black/45">Limit 1 promo per order.</p>
        </div> */}

        <div className="space-y-4">
          <PaymentOption
            title="Thanh toán khi nhận hàng (COD)"
            subtitle="Thanh toán bằng tiền mặt khi đơn hàng được giao đến bạn."
            active={formData.paymentMethod === "COD"}
            onClick={() => onSelectPayment("COD")}
            icon={<CashIcon />}
          />

          <PaymentOption
            title="MoMo"
            subtitle="Thanh toán qua ví điện tử MoMo."
            active={formData.paymentMethod === "MOMO"}
            onClick={() => onSelectPayment("MOMO")}
            icon={<MomoIcon />}
          />

          <PaymentOption
            title="VNPay"
            subtitle="Thanh toán online qua cổng VNPay."
            active={formData.paymentMethod === "VNPAY"}
            onClick={() => onSelectPayment("VNPAY")}
            icon={<VnpayIcon />}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>

          <Link
            to="/cart"
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-4 text-base font-semibold text-black transition hover:border-black"
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      </section>
    </form>
  );
};

const CashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
    <path d="M2.25 8.25h19.5v7.5H2.25v-7.5Zm3.75 2.25h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008ZM18 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MomoIcon = () => (
  <div className="rounded-full bg-[#ae2070] px-2 py-1 text-xs font-black tracking-tight text-white">momo</div>
);

const VnpayIcon = () => (
  <div className="rounded-full bg-[#0055ff] px-2 py-1 text-xs font-black tracking-tight text-white">VNPay</div>
);

export default CheckoutForm;
