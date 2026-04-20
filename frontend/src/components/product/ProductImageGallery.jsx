import { useMemo } from "react";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const ArrowIcon = ({ direction = "left" }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={`h-5 w-5 ${direction === "right" ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="m12.5 4.5-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProductImageGallery = ({ images = [], selectedImage, onSelectImage, badgeLabel }) => {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [images]
  );

  const activeImage =
    selectedImage ||
    sortedImages.find((item) => item.isThumbnail)?.imageUrl ||
    sortedImages[0]?.imageUrl ||
    "";

  const activeIndex = Math.max(
    0,
    sortedImages.findIndex((item) => item.imageUrl === activeImage)
  );

  const changeImage = (step) => {
    if (!sortedImages.length) return;
    const nextIndex = (activeIndex + step + sortedImages.length) % sortedImages.length;
    onSelectImage(sortedImages[nextIndex].imageUrl);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[64px_minmax(0,1fr)] lg:items-start xl:grid-cols-[74px_minmax(0,1fr)] xl:gap-5">
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[760px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
        {sortedImages.map((image, index) => {
          const isActive = activeImage === image.imageUrl;
          return (
            <button
              key={image.id || `${image.imageUrl}-${index}`}
              type="button"
              onClick={() => onSelectImage(image.imageUrl)}
              className={`shrink-0 overflow-hidden rounded-lg border transition ${
                isActive ? "border-black" : "border-transparent hover:border-black/20"
              }`}
            >
              <img
                src={resolveImageUrl(image.imageUrl)}
                alt={`thumbnail-${index + 1}`}
                className="h-16 w-16 object-cover lg:h-[74px] lg:w-[74px]"
              />
            </button>
          );
        })}
      </div>

      <div className="order-1 relative overflow-hidden bg-[#efefef] lg:order-2">
        {badgeLabel ? (
          <div className="absolute left-6 top-6 z-10 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm">
            ★ {badgeLabel}
          </div>
        ) : null}

        {activeImage ? (
          <img
            src={resolveImageUrl(activeImage)}
            alt="product"
            className="h-[420px] w-full object-contain sm:h-[560px] xl:h-[680px]"
          />
        ) : (
          <div className="flex h-[420px] items-center justify-center text-sm text-black/35 sm:h-[560px] xl:h-[680px]">
            No image
          </div>
        )}

        {sortedImages.length > 1 ? (
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => changeImage(-1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
              aria-label="Previous image"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => changeImage(1)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
              aria-label="Next image"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductImageGallery;
