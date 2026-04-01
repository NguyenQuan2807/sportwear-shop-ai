import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const sortBySize = (variants) => {
  return [...variants].sort((a, b) => {
    const sizeA = String(a.size || "").toUpperCase();
    const sizeB = String(b.size || "").toUpperCase();
    const indexA = sizeOrder.indexOf(sizeA);
    const indexB = sizeOrder.indexOf(sizeB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return sizeA.localeCompare(sizeB, "vi");
  });
};

const ProductVariantSelector = ({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) => {
  const availableColors = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .map((variant) => String(variant.color || "").trim())
          .filter(Boolean)
      )
    );
  }, [variants]);

  const selectedColor = selectedVariant?.color || availableColors[0] || "";

  const variantsBySelectedColor = useMemo(() => {
    return sortBySize(
      variants.filter(
        (variant) =>
          normalizeText(variant.color) === normalizeText(selectedColor)
      )
    );
  }, [variants, selectedColor]);

  const handleSelectColor = (color) => {
    const matchedVariants = sortBySize(
      variants.filter(
        (variant) => normalizeText(variant.color) === normalizeText(color)
      )
    );

    const preferred =
      matchedVariants.find((variant) => Number(variant.stockQuantity || 0) > 0) ||
      matchedVariants[0];

    if (preferred) {
      onSelectVariant(preferred);
    }
  };

  const handleSelectSize = (variant) => {
    onSelectVariant(variant);
  };

  if (!variants.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-slate-500">Sản phẩm chưa có biến thể.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Variant Selection
        </p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">
          Chọn màu và size
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Có {variants.length} biến thể khả dụng
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Màu sắc</p>
          <p className="text-sm text-slate-500">{selectedColor || "Chưa chọn"}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const isActive = normalizeText(color) === normalizeText(selectedColor);

            return (
              <button
                key={color}
                type="button"
                onClick={() => handleSelectColor(color)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Kích thước</p>
          <p className="text-sm text-slate-500">
            {variantsBySelectedColor.length} size
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {variantsBySelectedColor.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            const outOfStock = Number(variant.stockQuantity || 0) <= 0;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => handleSelectSize(variant)}
                className={`min-w-[82px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : outOfStock
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div>{variant.size}</div>
                <div className="mt-1 text-[11px] font-medium opacity-80">
                  {outOfStock ? "Hết hàng" : `Kho: ${variant.stockQuantity}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedVariant && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  Size {selectedVariant.size}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedVariant.color}
                </span>
                {selectedVariant.onPromotion && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                    -{selectedVariant.discountPercent || 0}%
                  </span>
                )}
                {selectedVariant.flashSale && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                    Flash Sale
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500">SKU: {selectedVariant.sku}</p>

              {selectedVariant.appliedPromotion?.promotionName && (
                <p className="text-sm font-medium text-emerald-600">
                  {selectedVariant.appliedPromotion.promotionName}
                </p>
              )}
            </div>

            <div className="text-right">
              {!selectedVariant.onPromotion ? (
                <>
                  <p className="text-sm text-slate-500">Giá bán</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(selectedVariant.price)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500">Giá ưu đãi</p>
                  <p className="text-sm text-slate-400 line-through">
                    {formatCurrency(selectedVariant.originalPrice)}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(selectedVariant.finalPrice)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;