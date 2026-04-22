import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const sortBySize = (variants) => {
  return [...variants].sort((a, b) => {
    const sizeA = String(a.size || "").toUpperCase();
    const sizeB = String(b.size || "").toUpperCase();
    const indexA = sizeOrder.indexOf(sizeA);
    const indexB = sizeOrder.indexOf(sizeB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return sizeA.localeCompare(sizeB, "vi", { numeric: true });
  });
};

const getColorOptions = (product) => {
  if (!product?.variants?.length) return [];

  const uniqueColors = Array.from(
    new Set(product.variants.map((variant) => String(variant.color || "").trim()).filter(Boolean))
  );

  return uniqueColors.map((color) => {
    const matchedImage = product.images?.find(
      (image) => normalizeText(image.color) === normalizeText(color)
    ) || product.images?.[0];

    return {
      color,
      imageUrl: matchedImage?.imageUrl || product.thumbnailUrl,
    };
  });
};

const getImagesByColor = (product, color) => {
  if (!product?.images?.length) return [];

  const exactColorImages = product.images.filter(
    (image) => normalizeText(image.color) === normalizeText(color)
  );

  const images = exactColorImages.length > 0 ? exactColorImages : product.images;
  return [...images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

const WishlistVariantModal = ({
  product,
  loadingData,
  selectedColor,
  selectedVariant,
  selectedImage,
  errorMessage,
  loading,
  onClose,
  onSelectColor,
  onSelectVariant,
  onSelectImage,
  onConfirm,
}) => {
  if (!product) return null;

  const colorOptions = getColorOptions(product);
  const filteredImages = getImagesByColor(product, selectedColor);
  const variantsByColor = sortBySize(
    (product?.variants || []).filter(
      (variant) => normalizeText(variant.color) === normalizeText(selectedColor)
    )
  );
  const displayImage = resolveImageUrl(selectedImage || filteredImages[0]?.imageUrl || product?.thumbnailUrl);
  const displayPrice = selectedVariant?.finalPrice ?? selectedVariant?.price ?? product?.finalPrice ?? product?.price ?? null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="relative w-full max-w-[1180px] overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-black transition hover:bg-black/10"
          aria-label="Đóng"
        >
          ✕
        </button>

        {loadingData ? (
          <div className="grid min-h-[640px] md:grid-cols-[1.05fr_1fr]">
            <div className="bg-[#f5f5f5] p-8 md:p-10">
              <div className="h-full min-h-[420px] animate-pulse rounded-[24px] bg-black/6" />
            </div>
            <div className="p-8 md:p-10">
              <div className="h-9 w-2/3 animate-pulse rounded bg-black/6" />
              <div className="mt-3 h-6 w-1/3 animate-pulse rounded bg-black/6" />
              <div className="mt-6 h-8 w-1/4 animate-pulse rounded bg-black/6" />
              <div className="mt-10 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[84px] animate-pulse rounded-2xl bg-black/6" />
                ))}
              </div>
              <div className="mt-8 grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-black/6" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[640px] md:grid-cols-[1.05fr_1fr]">
            <div className="bg-[#f5f5f5] p-8 md:p-10">
              <div className="flex h-full flex-col gap-5">
                <div className="flex-1 overflow-hidden rounded-[24px] bg-white/70">
                  {displayImage ? (
                    <img src={displayImage} alt={product?.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-black/35">
                      No image
                    </div>
                  )}
                </div>

                {filteredImages.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {filteredImages.map((image) => {
                      const imageUrl = resolveImageUrl(image.imageUrl);
                      const isActive = image.imageUrl === selectedImage;
                      return (
                        <button
                          key={`${image.imageUrl}-${image.sortOrder || 0}`}
                          type="button"
                          onClick={() => onSelectImage(image.imageUrl)}
                          className={`overflow-hidden rounded-2xl border bg-white ${
                            isActive ? "border-black" : "border-black/10 hover:border-black/35"
                          }`}
                        >
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.name} className="aspect-square w-full object-cover" />
                          ) : (
                            <div className="aspect-square w-full bg-black/5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-[50px] flex flex-col p-8 md:p-10">
              <div>
                <h3 className="text-[28px] font-semibold tracking-tight text-black">{product?.name}</h3>
                <p className="mt-1 text-[18px] text-black/65">
                  {product?.gender === "MALE"
                    ? "Men's Shoes"
                    : product?.gender === "FEMALE"
                    ? "Women's Shoes"
                    : product?.gender === "UNISEX"
                    ? "Unisex Shoes"
                    : product?.categoryName || "Shoes"}
                </p>
                {displayPrice != null ? (
                  <p className="mt-4 text-[20px] font-semibold text-black">{formatCurrency(displayPrice)}</p>
                ) : null}
              </div>

              {colorOptions.length > 0 ? (
                <div className="mt-8">
                  <div className="mb-3 text-sm font-medium text-black/60">Chọn màu</div>
                  <div className="grid grid-cols-2 gap-3">
                    {colorOptions.map((option) => {
                      const imageUrl = resolveImageUrl(option.imageUrl);
                      const isActive = normalizeText(option.color) === normalizeText(selectedColor);
                      return (
                        <button
                          key={option.color}
                          type="button"
                          onClick={() => onSelectColor(option.color)}
                          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            isActive ? "border-black shadow-[inset_0_0_0_1px_#000]" : "border-black/10 hover:border-black/35"
                          }`}
                        >
                          <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#f5f5f5]">
                            {imageUrl ? (
                              <img src={imageUrl} alt={option.color} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-black/5" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-black/55">Color</div>
                            <div className="text-base font-semibold text-black">{option.color}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-8">
                <div className="mb-3 text-sm font-medium text-black/60">Chọn size</div>
                <div className={`rounded-2xl border p-4 ${errorMessage ? "border-red-300" : "border-black/10"}`}>
                  {variantsByColor.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                      {variantsByColor.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const outOfStock = Number(variant.stockQuantity || 0) <= 0;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => onSelectVariant(variant)}
                            disabled={outOfStock}
                            className={`min-h-[56px] rounded-xl border text-base font-medium transition ${
                              isSelected
                                ? "border-black bg-black text-white"
                                : outOfStock
                                ? "border-black/10 bg-[#f5f5f5] text-black/30"
                                : "border-black/15 bg-white text-black hover:border-black/35"
                            }`}
                          >
                            {variant.size}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-black/55">Không có size khả dụng cho màu này.</div>
                  )}
                </div>
                {errorMessage ? <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/10 pt-8">
                <Link
                  to={`/products/${product.id}`}
                  className="text-[16px] font-semibold text-black underline underline-offset-4"
                >
                  Xem chi tiết sản phẩm
                </Link>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading || loadingData}
                  className="inline-flex min-h-[56px] min-w-[170px] items-center justify-center rounded-full bg-black px-7 py-4 text-[17px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistVariantModal;
