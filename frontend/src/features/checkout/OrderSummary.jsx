import { formatCurrency } from "../../utils/formatCurrency";

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

const OrderSummary = ({
  items,
  totalQuantity,
  subTotalAmount,
  discountAmount,
  totalAmount,
}) => {
  return (
    <aside className="space-y-4">
      <div className="sticky top-28 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Order Summary
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          Đơn hàng của bạn
        </h2>

        {discountAmount > 0 ? (
          <div className="mt-5 rounded-[24px] border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-white px-4 py-4 text-sm text-red-500">
            Đơn hàng của bạn đang được áp dụng khuyến mãi.
          </div>
        ) : null}

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

                    {item.promotionName ? (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {item.flashSale ? "Flash Sale: " : "Khuyến mãi: "}
                        {item.promotionName}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] bg-slate-50 p-5">
          <SummaryRow label="Dòng sản phẩm" value={items.length} />
          <SummaryRow label="Tổng số lượng" value={totalQuantity} />
          <SummaryRow label="Tạm tính" value={formatCurrency(subTotalAmount)} />
          <SummaryRow
            label="Giảm giá"
            value={`- ${formatCurrency(discountAmount)}`}
            highlight="danger"
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="text-base font-semibold text-slate-600">Tổng cộng</span>
          <span className="text-2xl font-black tracking-tight text-red-500">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default OrderSummary;
