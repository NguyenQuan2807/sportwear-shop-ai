import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const CartItemCard = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  loadingItemId,
  deletingItemId,
}) => {
  const isUpdating = loadingItemId === item.id;
  const isDeleting = deletingItemId === item.id;
  const thumbnailSrc = resolveImageUrl(item.thumbnailUrl);
  const subtitle = item.categoryName || item.productSubtitle || "Sản phẩm thể thao";
  const detailText = [item.color, item.size ? `Size ${item.size}` : null].filter(Boolean).join(" · ");
  const productHref = item.productId ? `/products/${item.productId}` : null;
  const showLowStock = typeof item.stockQuantity === "number" && item.stockQuantity > 0 && item.stockQuantity <= 5;

  const TitleWrapper = productHref ? Link : "div";
  const titleProps = productHref ? { to: productHref } : {};

  return (
    <article className="border-b border-black/10 pb-7 last:border-b-0 last:pb-0">
      <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt={item.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
              No image
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <TitleWrapper {...titleProps} className="block text-[18px] font-semibold leading-7 text-black">
                {item.productName}
              </TitleWrapper>
              <p className="mt-1 text-[17px] leading-7 text-black/55">{subtitle}</p>
              {detailText ? <p className="mt-1 text-[17px] leading-7 text-black/68">{detailText}</p> : null}
            </div>

            <div className="text-left text-[18px] font-semibold text-black sm:pl-6 sm:text-right">
              {formatCurrency(item.totalPrice || item.price)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={isDeleting}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Remove item"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => onDecrease(item)}
                disabled={isUpdating || item.quantity <= 1}
                className="inline-flex h-12 w-10 items-center justify-center text-lg text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span className="min-w-[30px] text-center text-[17px] font-medium text-black">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item)}
                disabled={isUpdating}
                className="inline-flex h-12 w-10 items-center justify-center text-xl text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 text-black transition hover:border-black/30 hover:bg-black/5"
              aria-label="Save for later"
            >
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>

          {showLowStock ? (
            <div className="flex items-center gap-3 text-[17px] text-[#b7791f]">
              <ClockIcon className="h-5 w-5 shrink-0" />
              <span>Chỉ còn vài sản phẩm thôi. Hãy đặt hàng sớm nhé!</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
const TrashIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M14.74 9 14.394 18m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084A2.25 2.25 0 0 1 5.84 19.673L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0V4.875A2.25 2.25 0 0 0 13.5 2.625h-3A2.25 2.25 0 0 0 8.25 4.875V5.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="m21 8.25c0-2.485-2.239-4.5-5-4.5-1.933 0-3.61.988-4.5 2.433C10.61 4.738 8.933 3.75 7 3.75c-2.761 0-5 2.015-5 4.5 0 7.22 10 12 10 12s10-4.78 10-12Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M12 6.75v5.25l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CartItemCard;
