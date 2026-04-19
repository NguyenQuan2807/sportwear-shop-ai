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

const PriceBlock = ({ product }) => {
  const hasPromotion = Boolean(product?.onPromotion);

  if (!hasPromotion) {
    if (product?.minPrice == null && product?.maxPrice == null) {
      return <p className="text-base font-semibold text-black sm:text-lg">Liên hệ</p>;
    }

    if (product?.minPrice === product?.maxPrice) {
      return <p className="text-base font-semibold text-black sm:text-lg">{formatCurrency(product.minPrice)}</p>;
    }

    return (
      <p className="text-base font-semibold text-black sm:text-lg">
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
      <p className="text-sm text-black/35 line-through">
        {originalSame
          ? formatCurrency(product.originalMinPrice)
          : `${formatCurrency(product.originalMinPrice)} - ${formatCurrency(product.originalMaxPrice)}`}
      </p>
      <p className="text-base font-semibold text-[#d53939] sm:text-lg">
        {saleSame
          ? formatCurrency(product.saleMinPrice)
          : `${formatCurrency(product.saleMinPrice)} - ${formatCurrency(product.saleMaxPrice)}`}
      </p>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist(product);
  const imageSrc = resolveImageUrl(product?.thumbnailUrl);
  const hasPromotion = Boolean(product?.onPromotion);
  const meta = [product?.brandName, product?.sportName].filter(Boolean).join(" • ");

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      <article className="flex h-full flex-col">
        <div className="relative overflow-hidden bg-[#f5f5f5] aspect-[4/5]">
          {product?.thumbnailUrl ? (
            <img
              src={imageSrc}
              alt={product?.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-black/30">
              No image
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isWishlisted
                ? "border-black bg-black text-white"
                : "border-white/70 bg-white/90 text-black hover:bg-white"
            }`}
            aria-label={isWishlisted ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <HeartIcon active={isWishlisted} />
          </button>

          <div className="absolute left-4 top-4 flex flex-wrap gap-2 pr-14">
            {hasPromotion ? (
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d53939] shadow-sm">
                -{product?.maxDiscountPercent || 0}%
              </span>
            ) : null}
            {product?.flashSale ? (
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                Flash
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-4 items-center justify-between gap-3 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-4 pb-4 pt-10 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-full bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
              Xem chi tiết
            </span>
            <span className="rounded-full bg-black/75 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              {product?.inStock ? "In stock" : "Sold out"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/38">
              {meta || "Sportwear"}
            </p>
            <h3 className="line-clamp-2 min-h-[52px] text-[15px] font-semibold leading-6 text-black sm:text-base">
              {product?.name}
            </h3>
            <p className="text-sm text-black/45">{product?.categoryName || "Sản phẩm thể thao"}</p>
          </div>

          <div className="mt-4">
            <PriceBlock product={product} />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
