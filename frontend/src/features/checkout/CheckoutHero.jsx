import { formatCurrency } from "../../utils/formatCurrency";

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
      {label}
    </p>
    <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
  </div>
);

const CheckoutHero = ({
  itemCount,
  totalQuantity,
  subTotalAmount,
  discountAmount,
  totalAmount,
}) => {
  return (
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
              {itemCount} dòng sản phẩm
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
  );
};

export default CheckoutHero;
