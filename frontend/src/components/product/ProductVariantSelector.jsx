import { formatCurrency } from "../../utils/formatCurrency";

const ProductVariantSelector = ({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) => {
  if (!variants.length) {
    return (
      <div className="rounded-xl bg-slate-100 p-4 text-slate-500">
        Sản phẩm chưa có biến thể.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800">Chọn biến thể</h3>

      <div className="space-y-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const hasPromotion = Boolean(variant.onPromotion);
          const isFlashSale = Boolean(variant.flashSale);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">
                      Size: {variant.size} - Màu: {variant.color}
                    </p>

                    {hasPromotion && (
                      <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                        -{variant.discountPercent || 0}%
                      </span>
                    )}

                    {isFlashSale && (
                      <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                        Flash Sale
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">SKU: {variant.sku}</p>

                  {variant.appliedPromotion?.promotionName && (
                    <p className="text-sm font-medium text-red-600">
                      {variant.appliedPromotion.promotionName}
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-right">
                  {!hasPromotion ? (
                    <p className="font-bold text-blue-600">
                      {formatCurrency(variant.price)}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400 line-through">
                        {formatCurrency(variant.originalPrice)}
                      </p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(variant.finalPrice)}
                      </p>
                    </>
                  )}

                  <p className="text-sm text-slate-500">
                    Tồn kho: {variant.stockQuantity}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariantSelector;