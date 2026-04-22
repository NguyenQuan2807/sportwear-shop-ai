import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const getVariantPriceInfo = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variant = variants.find((item) => item?.finalPrice != null || item?.price != null) || variants[0];

  if (!variant) return null;

  const currentPrice = variant.finalPrice ?? variant.price ?? null;
  const originalPrice = variant.originalPrice ?? currentPrice ?? null;
  const hasPromotion = Boolean(
    variant.onPromotion || (originalPrice != null && currentPrice != null && originalPrice > currentPrice)
  );

  return { currentPrice, originalPrice, hasPromotion };
};

const getProductPriceInfo = (product) => {
  const variantInfo = getVariantPriceInfo(product);
  if (variantInfo?.currentPrice != null) return variantInfo;

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

const CartWishlistSection = ({ wishlistItems = [], onOpenVariantModal, recentlyAddedProductId = null }) => {
  if (!wishlistItems.length) return null;

  return (
    <section className="mt-12 border-t border-black/10 pt-10">
      <h2 className="text-4xl font-semibold tracking-tight text-black">Yêu thích</h2>

      <div className="mt-7 grid gap-6 md:grid-cols-2 xl:gap-8">
        {wishlistItems.map((product) => {
          const imageSrc = resolveImageUrl(product?.thumbnailUrl);
          const subtitle = [
            product?.gender === "MALE"
              ? "Men's"
              : product?.gender === "FEMALE"
              ? "Women's"
              : product?.gender === "UNISEX"
              ? "Unisex"
              : null,
            product?.categoryName || product?.sportName || "Shoes",
          ]
            .filter(Boolean)
            .join(" ");

          const isAdded = recentlyAddedProductId === product.id;

          return (
            <article key={product.id} className="border-b border-black/10 pb-8">
                <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-4 bg-white">
                    <Link
                    to={`/products/${product.id}`}
                    className="block aspect-square overflow-hidden bg-[#f5f5f5]"
                    >
                    {imageSrc ? (
                        <img src={imageSrc} alt={product?.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
                        No image
                        </div>
                    )}
                    </Link>

                    <div className="min-w-0 py-1">
                    <Link
                        to={`/products/${product.id}`}
                        className="block text-[18px] font-semibold leading-7 text-black"
                    >
                        {product?.name}
                    </Link>

                    <p className="mt-1 text-[17px] leading-7 text-black/55">
                        {subtitle || "Sport Shoes"}
                    </p>

                    <div className="mt-3">
                        <PriceRow product={product} />
                    </div>
                    </div>
                </div>
        
                <button
                    type="button"
                    onClick={() => onOpenVariantModal(product)}
                    className={`mt-5 inline-flex min-h-[52px] items-center justify-center rounded-full border px-6 py-3.5 text-[17px] font-medium transition ${
                    isAdded
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-black/15 bg-white text-black hover:border-black"
                    }`}
                >
                    {isAdded ? "Đã thêm" : "Thêm vào giỏ hàng"}
                </button>
                </article>
          );
        })}
      </div>

      <Link
        to="/wishlist"
        className="mt-8 inline-flex items-center text-[17px] font-medium text-black underline underline-offset-4"
      >
        Đi đến trang yêu thích
      </Link>
    </section>
  );
};

export default CartWishlistSection;
