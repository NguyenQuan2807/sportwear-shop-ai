import { formatCurrency } from "../../utils/formatCurrency";

const ProductVariantSelector = ({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) => {
  if (!variants.length) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Sản phẩm chưa có biến thể.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Variant Selection
          </p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            Chọn biến thể phù hợp
          </h3>
        </div>

        <p className="text-sm text-slate-500">
          Có <span className="font-semibold text-slate-900">{variants.length}</span>{" "}
          biến thể khả dụng
        </p>
      </div>

      <div className="space-y-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const hasPromotion = Boolean(variant.onPromotion);
          const isFlashSale = Boolean(variant.flashSale);
          const outOfStock = Number(variant.stockQuantity || 0) <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant)}
              className={`w-full rounded-[24px] border p-4 text-left transition duration-200 sm:p-5 ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Size {variant.size}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {variant.color}
                    </span>

                    {hasPromotion && (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow">
                        -{variant.discountPercent || 0}%
                      </span>
                    )}

                    {isFlashSale && (
                      <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow">
                        Flash Sale
                      </span>
                    )}

                    {outOfStock && (
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        Hết hàng
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-lg font-black tracking-tight ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Size: {variant.size} • Màu: {variant.color}
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        isSelected ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      SKU: {variant.sku}
                    </p>
                  </div>

                  {variant.appliedPromotion?.promotionName && (
                    <div
                      className={`inline-flex max-w-full rounded-2xl px-3 py-2 text-sm font-semibold ${
                        isSelected
                          ? "bg-white/10 text-white"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {variant.appliedPromotion.promotionName}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:min-w-[220px]">
                  <div className="rounded-[20px] border border-black/5 bg-black/5 p-4 backdrop-blur">
                    {!hasPromotion ? (
                      <>
                        <p
                          className={`text-xs font-bold uppercase tracking-[0.18em] ${
                            isSelected ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          Giá bán
                        </p>
                        <p
                          className={`mt-2 text-2xl font-black tracking-tight ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(variant.price)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className={`text-xs font-bold uppercase tracking-[0.18em] ${
                            isSelected ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          Giá ưu đãi
                        </p>
                        <p
                          className={`mt-1 text-sm line-through ${
                            isSelected ? "text-white/50" : "text-slate-400"
                          }`}
                        >
                          {formatCurrency(variant.originalPrice)}
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-red-400">
                          {formatCurrency(variant.finalPrice)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat
                      isSelected={isSelected}
                      label="Tồn kho"
                      value={variant.stockQuantity ?? 0}
                    />
                    <MiniStat
                      isSelected={isSelected}
                      label="Trạng thái"
                      value={outOfStock ? "Hết" : "Sẵn"}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, isSelected }) => (
  <div
    className={`rounded-[18px] px-4 py-3 ${
      isSelected ? "bg-white/10" : "bg-slate-50"
    }`}
  >
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
        isSelected ? "text-white/60" : "text-slate-400"
      }`}
    >
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-bold ${
        isSelected ? "text-white" : "text-slate-800"
      }`}
    >
      {value}
    </p>
  </div>
);

export default ProductVariantSelector;