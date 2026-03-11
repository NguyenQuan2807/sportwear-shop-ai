import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductCard = ({ product }) => {
  const hasPromotion = Boolean(product.onPromotion);
  const isFlashSale = Boolean(product.flashSale);

  const renderPrice = () => {
    if (!hasPromotion) {
      if (product.minPrice == null && product.maxPrice == null) {
        return <p className="text-lg font-bold text-slate-900">Liên hệ</p>;
      }

      if (product.minPrice === product.maxPrice) {
        return (
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(product.minPrice)}
          </p>
        );
      }

      return (
        <p className="text-lg font-bold text-slate-900">
          {formatCurrency(product.minPrice)} - {formatCurrency(product.maxPrice)}
        </p>
      );
    }

    const originalSame =
      product.originalMinPrice != null &&
      product.originalMaxPrice != null &&
      product.originalMinPrice === product.originalMaxPrice;

    const saleSame =
      product.saleMinPrice != null &&
      product.saleMaxPrice != null &&
      product.saleMinPrice === product.saleMaxPrice;

    return (
      <div className="space-y-1">
        <div className="text-sm text-slate-400 line-through">
          {originalSame
            ? formatCurrency(product.originalMinPrice)
            : `${formatCurrency(product.originalMinPrice)} - ${formatCurrency(
                product.originalMaxPrice
              )}`}
        </div>

        <div className="text-lg font-bold text-red-600">
          {saleSame
            ? formatCurrency(product.saleMinPrice)
            : `${formatCurrency(product.saleMinPrice)} - ${formatCurrency(
                product.saleMaxPrice
              )}`}
        </div>
      </div>
    );
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square w-full bg-slate-100">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No Image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasPromotion && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
              -{product.maxDiscountPercent || 0}%
            </span>
          )}

          {isFlashSale && (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow">
              Flash Sale
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          {product.sportName}
        </p>

        <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-slate-800">
          {product.name}
        </h3>

        {renderPrice()}

        <div className="space-y-1 text-sm text-slate-500">
          <p>Brand: {product.brandName}</p>
          <p>Category: {product.categoryName}</p>
          <p>Gender: {product.gender}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              product.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {product.isActive ? "Đang bán" : "Ngừng bán"}
          </span>

          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              product.inStock
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {product.inStock ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;