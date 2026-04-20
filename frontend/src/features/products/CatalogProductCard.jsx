import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const genderLabelMap = {
  MALE: "nam",
  FEMALE: "nữ",
  UNISEX: "unisex",
};

const CatalogProductCard = ({ product }) => {
  const imageSrc = resolveImageUrl(product?.thumbnailUrl);
  const infoText = [product?.categoryName, genderLabelMap[product?.gender]]
    .filter(Boolean)
    .join(" ")
    .replace(/^./, (char) => char.toUpperCase());

  const colorCountLabel = `${product?.colorCount || 0} màu`;
  const hasPromotion = Boolean(product?.onPromotion);

  const salePrice = product?.saleMinPrice ?? product?.minPrice;
  const originalPrice = product?.originalMinPrice ?? product?.maxPrice;

  const sameSaleRange = product?.saleMinPrice === product?.saleMaxPrice;
  const sameOriginalRange = product?.originalMinPrice === product?.originalMaxPrice;

  const saleLabel = sameSaleRange
    ? formatCurrency(salePrice)
    : `${formatCurrency(product?.saleMinPrice)} - ${formatCurrency(product?.saleMaxPrice)}`;

  const originalLabel = sameOriginalRange
    ? formatCurrency(originalPrice)
    : `${formatCurrency(product?.originalMinPrice)} - ${formatCurrency(product?.originalMaxPrice)}`;

  const regularLabel =
    product?.minPrice === product?.maxPrice
      ? formatCurrency(product?.minPrice)
      : `${formatCurrency(product?.minPrice)} - ${formatCurrency(product?.maxPrice)}`;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <article className="flex h-full flex-col">
        <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
          {product?.thumbnailUrl ? (
            <img
              src={imageSrc}
              alt={product?.name}
              className="h-full w-full object-cover transition duration-500 "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-black/30">
              No image
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-black">
            {product?.name}
          </h3>
          <p className="text-sm text-black/60">{infoText || "Sản phẩm thể thao"}</p>
          <p className="text-sm text-black/60">{colorCountLabel}</p>

          {hasPromotion ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-black">{saleLabel}</span>
                <span className="text-black/35 line-through">{originalLabel}</span>
              </div>
              <p className="text-sm font-semibold text-green-600">
                Giảm giá {product?.maxDiscountPercent || 0}%
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-black">{regularLabel}</p>
          )}
        </div>
      </article>
    </Link>
  );
};

export default CatalogProductCard;
