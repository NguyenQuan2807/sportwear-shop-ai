import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const SummaryRow = ({ label, value, strike = false, highlight = false }) => (
  <div className="flex items-center justify-between gap-4 text-[17px]">
    <span className="text-black/75">{label}</span>
    <span
      className={`font-medium ${
        strike ? "text-black/45 line-through" : highlight ? "text-green-600" : "text-black"
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
  shippingFee,
  totalAmount,
}) => {
  // const originalAmount = subTotalAmount + discountAmount;

  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="space-y-6 bg-white p-7  ring-1 ring-black/5">
        <div>
          <h2 className="text-[32px] font-semibold tracking-tight text-black">Tóm tắt đơn hàng</h2>

          <div className="mt-7 space-y-4 border-b border-black/10 pb-6">
            <SummaryRow label="Tạm tính" value={formatCurrency(totalAmount)} />
            {discountAmount > 0 ? (
              <SummaryRow label="Giá gốc" value={formatCurrency(subTotalAmount)} strike />
            ) : null}
            <SummaryRow label="Phí giao hàng" value={shippingFee > 0 ? formatCurrency(shippingFee) : "Free"} />
          </div>

          <div className="flex items-center justify-between gap-4 pt-5 text-[20px] font-semibold text-black">
            <span>Tổng giá</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          {discountAmount > 0 ? (
            <div className="mt-3 flex items-center gap-3 text-[17px] font-medium text-green-600">
              <TagIcon className="h-5 w-5" />
              <span>Tiết kiệm {formatCurrency(discountAmount)}</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/10 pt-6">
          <p className="text-[22px] font-medium tracking-tight text-black">
            Dự kiến giao hàng 2-5 ngày làm việc
          </p>

          <div className="mt-5 space-y-5">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[110px_minmax(0,1fr)] gap-4">
                <div className="aspect-[1.2/1] overflow-hidden rounded-2xl bg-[#f5f5f5]">
                  {item.thumbnailUrl ? (
                    <img
                      src={resolveImageUrl(item.thumbnailUrl)}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-black/35">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-[17px] leading-7 text-black/70">
                  <h3 className="line-clamp-2 text-[18px] font-semibold leading-7 text-black">
                    {item.productName}
                  </h3>
                  <p className="text-black/55">Số lượng: {item.quantity}</p>
                  <p className="text-black/55">Size: {item.size}</p>

                  {item.onPromotion ? (
                    <div className="mt-2">
                      <p className="text-[18px] font-semibold text-black">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-[17px] text-black/45 line-through">
                        {formatCurrency((item.originalPrice || 0) * item.quantity)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-[18px] font-semibold text-black">{formatCurrency(item.totalPrice)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </aside>
  );
};

const TagIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M9 3H4.5A1.5 1.5 0 0 0 3 4.5V9a1.5 1.5 0 0 0 .44 1.06l10.5 10.5a1.5 1.5 0 0 0 2.12 0l4.5-4.5a1.5 1.5 0 0 0 0-2.12L10.06 3.44A1.5 1.5 0 0 0 9 3Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 7.5h.008v.008H7.5V7.5Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default OrderSummary;
