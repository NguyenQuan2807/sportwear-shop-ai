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
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path
      d="M12 20.2s-6.7-4.35-9.2-8.28C1.22 9.55 2.1 6.5 4.9 5.45c2.02-.76 3.72.05 4.77 1.4L12 9.2l2.33-2.35c1.05-1.35 2.75-2.16 4.77-1.4 2.8 1.05 3.68 4.1 2.1 6.47C18.7 15.85 12 20.2 12 20.2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getVariantPriceInfo = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variant = variants.find((item) => item?.finalPrice != null || item?.price != null) || variants[0];

  if (!variant) return null;

  const currentPrice =
    variant.finalPrice ??
    variant.price ??
    null;

  const originalPrice =
    variant.originalPrice ??
    currentPrice ??
    null;

  const hasPromotion = Boolean(
    variant.onPromotion ||
      (originalPrice != null && currentPrice != null && originalPrice > currentPrice)
  );

  return { currentPrice, originalPrice, hasPromotion };
};

const getProductPriceInfo = (product) => {
  const variantInfo = getVariantPriceInfo(product);

  if (variantInfo?.currentPrice != null) {
    return variantInfo;
  }

  const minPrice = product?.saleMinPrice ?? product?.finalPrice ?? product?.minPrice ?? product?.price ?? null;
  const originalMinPrice = product?.originalMinPrice ?? minPrice;
  const hasPromotion = Boolean(
    product?.onPromotion ||
      (originalMinPrice != null && minPrice != null && originalMinPrice > minPrice)
  );

  return {
    currentPrice: minPrice,
    originalPrice: originalMinPrice,
    hasPromotion,
  };
};

const PriceRow = ({ product }) => {
  const { currentPrice, originalPrice, hasPromotion } = getProductPriceInfo(product);

  if (currentPrice == null) {
    return <span className="text-[18px] font-semibold text-black">Liên hệ</span>;
  }

  if (!hasPromotion) {
    return <span className="text-[18px] font-semibold text-black">{formatCurrency(currentPrice)}</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-left">
      <span className="text-[18px] font-semibold text-black">{formatCurrency(currentPrice)}</span>
      <span className="text-[15px] text-black/45 line-through">{formatCurrency(originalPrice)}</span>
    </div>
  );
};

const WishlistProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist(product);
  const imageSrc = resolveImageUrl(product?.thumbnailUrl);
  const subtitle = [
    product?.gender === "MALE" ? "Men's" : product?.gender === "FEMALE" ? "Women's" : product?.gender === "UNISEX" ? "Unisex" : null,
    product?.categoryName || product?.sportName || "Shoes",
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article className="group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-[1/1] overflow-hidden bg-[#f5f5f5]">
          {product?.thumbnailUrl ? (
            <img
              src={imageSrc}
              alt={product?.name}
              className="h-full w-full object-cover transition duration-500 "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
              No image
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition"
            aria-label={isWishlisted ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <HeartIcon active={isWishlisted} />
          </button>
        </div>
      </Link>

      <div className="pt-4">
        <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="block text-[18px] font-semibold leading-7 text-black">
            {product?.name}
            </Link>
            <p className="mt-1 text-[17px] leading-7 text-black/55">
            {subtitle || "Sport Shoes"}
            </p>
        </div>
        <div className="mt-4">
            <PriceRow product={product} />
        </div>
        <Link
            to={`/products/${product.id}`}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3.5 text-[17px] font-medium text-black transition hover:border-black"
        >
            Thêm vào giỏ hàng
        </Link>
      </div>
    </article>
  );
};

export default WishlistProductCard;
