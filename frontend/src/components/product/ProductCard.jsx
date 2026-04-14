import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import useWishlist from "../../hooks/useWishlist";

const HeartIcon = ({ active = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path
      d="M12 20.2s-6.7-4.35-9.2-8.28C1.22 9.55 2.1 6.5 4.9 5.45c2.02-.76 3.72.05 4.77 1.4L12 9.2l2.33-2.35c1.05-1.35 2.75-2.16 4.77-1.4 2.8 1.05 3.68 4.1 2.1 6.47C18.7 15.85 12 20.2 12 20.2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist(product);

  const hasPromotion = Boolean(product?.onPromotion);
  const isFlashSale = Boolean(product?.flashSale);
  const imageSrc = resolveImageUrl(product?.thumbnailUrl);

  const meta = [product?.brandName, product?.sportName].filter(Boolean).join(" • ");

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
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
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400 line-through">
          {originalSame
            ? formatCurrency(product.originalMinPrice)
            : `${formatCurrency(product.originalMinPrice)} - ${formatCurrency(
                product.originalMaxPrice
              )}`}
        </p>

        <p className="text-xl font-black tracking-tight text-red-500">
          {saleSame
            ? formatCurrency(product.saleMinPrice)
            : `${formatCurrency(product.saleMinPrice)} - ${formatCurrency(
                product.saleMaxPrice
              )}`}
        </p>
      </div>
    );
  };

  return (
    <Link to={`/products/${product.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative overflow-hidden bg-slate-100">
          <div className="aspect-[4/5] w-full overflow-hidden">
            {product?.thumbnailUrl ? (
              <img
                src={imageSrc}
                alt={product?.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                No Image
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
              isWishlisted
                ? "border-red-500 bg-red-500 text-white"
                : "border-white/70 bg-white/90 text-slate-700 hover:bg-white"
            }`}
            aria-label={isWishlisted ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <HeartIcon active={isWishlisted} />
          </button>

          <div className="absolute left-4 top-4 flex flex-wrap gap-2 pr-14">
            {hasPromotion && (
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-500 shadow">
                -{product?.maxDiscountPercent || 0}%
              </span>
            )}

            {isFlashSale && (
              <span className="rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow">
                Flash
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {meta || "Sportwear"}
            </p>

            <h3 className="line-clamp-2 min-h-[52px] text-lg font-black leading-7 tracking-tight text-slate-900 transition group-hover:text-red-500">
              {product?.name}
            </h3>
          </div>

          <div className="mt-3">{renderPrice()}</div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-500">
              {product?.categoryName || "Sportwear"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                product?.inStock
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {product?.inStock ? "In stock" : "Sold out"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
