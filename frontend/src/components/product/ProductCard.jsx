import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductCard = ({ product }) => {
  const hasPromotion = Boolean(product?.onPromotion);
  const isFlashSale = Boolean(product?.flashSale);

  const sportName = product?.sportName || "Sport";
  const brandName = product?.brandName || "Brand";
  const categoryName = product?.categoryName || "Category";
  const gender = product?.gender || "UNISEX";

  const genderLabelMap = {
    MALE: "Nam",
    FEMALE: "Nữ",
    UNISEX: "Unisex",
  };

  const renderPrice = () => {
    if (!hasPromotion) {
      if (product?.minPrice == null && product?.maxPrice == null) {
        return <p className="text-xl font-black tracking-tight text-slate-900">Liên hệ</p>;
      }

      if (product?.minPrice === product?.maxPrice) {
        return (
          <p className="text-xl font-black tracking-tight text-slate-900">
            {formatCurrency(product.minPrice)}
          </p>
        );
      }

      return (
        <p className="text-xl font-black tracking-tight text-slate-900">
          {formatCurrency(product.minPrice)} - {formatCurrency(product.maxPrice)}
        </p>
      );
    }

    const originalSame =
      product?.originalMinPrice != null &&
      product?.originalMaxPrice != null &&
      product.originalMinPrice === product.originalMaxPrice;

    const saleSame =
      product?.saleMinPrice != null &&
      product?.saleMaxPrice != null &&
      product.saleMinPrice === product.saleMaxPrice;

    return (
      <div className="space-y-1.5">
        <div className="text-sm font-medium text-slate-400 line-through">
          {originalSame
            ? formatCurrency(product.originalMinPrice)
            : `${formatCurrency(product.originalMinPrice)} - ${formatCurrency(
                product.originalMaxPrice
              )}`}
        </div>

        <div className="text-xl font-black tracking-tight text-red-500">
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
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="aspect-[4/4.4] w-full overflow-hidden">
            {product?.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product?.name || "product"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
                No Image
              </div>
            )}
          </div>

          <div className="absolute left-4 top-4 flex max-w-[75%] flex-wrap gap-2">
            {hasPromotion && (
              <span className="rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                -{product?.maxDiscountPercent || 0}%
              </span>
            )}

            {isFlashSale && (
              <span className="rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                Flash Sale
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow ${
                product?.inStock
                  ? "bg-emerald-500 text-white"
                  : "bg-white/90 text-orange-600"
              }`}
            >
              {product?.inStock ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-xl backdrop-blur">
              <span>Xem chi tiết</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
              {sportName}
            </span>

            <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-red-500">
              {brandName}
            </span>
          </div>

          <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold leading-7 tracking-tight text-slate-900 transition group-hover:text-red-500">
            {product?.name}
          </h3>

          <div className="mt-4">{renderPrice()}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {categoryName}
            </span>

            <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {genderLabelMap[gender] || gender}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                product?.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {product?.isActive ? "Đang bán" : "Ngừng bán"}
            </span>
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-500">
                Khám phá ngay
              </span>

              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:bg-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;