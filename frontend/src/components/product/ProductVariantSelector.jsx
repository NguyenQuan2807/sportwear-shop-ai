import { useMemo } from "react";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

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

const ProductVariantSelector = ({ variants = [], selectedVariant, onSelectVariant, colorOptions = [] }) => {
  const selectedColor = selectedVariant?.color || colorOptions[0]?.color || "";

  const variantsBySelectedColor = useMemo(() => {
    return sortBySize(
      variants.filter(
        (variant) => normalizeText(variant.color) === normalizeText(selectedColor)
      )
    );
  }, [variants, selectedColor]);

  const handleSelectColor = (color) => {
    const matchedVariants = sortBySize(
      variants.filter((variant) => normalizeText(variant.color) === normalizeText(color))
    );

    const preferred =
      matchedVariants.find((variant) => Number(variant.stockQuantity || 0) > 0) || matchedVariants[0];

    if (preferred) {
      onSelectVariant(preferred);
    }
  };

  if (!variants.length) {
    return <p className="text-sm text-black/55">Sản phẩm chưa có biến thể.</p>;
  }

  return (
    <div className="space-y-8">
      {colorOptions.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {colorOptions.map((option) => {
              const isActive = normalizeText(option.color) === normalizeText(selectedColor);
              return (
                <button
                  key={option.color}
                  type="button"
                  onClick={() => handleSelectColor(option.color)}
                  className={`overflow-hidden rounded-md border bg-[#f5f5f5] transition ${
                    isActive ? "border-black" : "border-transparent hover:border-black/20"
                  }`}
                  title={option.color}
                >
                  <img
                    src={resolveImageUrl(option.imageUrl)}
                    alt={option.color}
                    className="h-16 w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[28px] font-semibold tracking-tight text-black">Chọn size</h3>
          <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-black/80">
            <span>⌂</span>
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {variantsBySelectedColor.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            const outOfStock = Number(variant.stockQuantity || 0) <= 0;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant)}
                className={`min-h-[62px] rounded-md border px-4 py-3 text-base font-medium transition ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : outOfStock
                    ? "border-black/10 bg-[#f5f5f5] text-black/30"
                    : "border-black/15 bg-white text-black hover:border-black/35"
                }`}
                disabled={outOfStock}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductVariantSelector;
