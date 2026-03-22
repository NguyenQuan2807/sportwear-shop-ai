import { useMemo } from "react";

const ProductImageGallery = ({ images = [], selectedImage, onSelectImage }) => {
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [images]);

  const hasImages = sortedImages.length > 0;
  const activeImage =
    selectedImage ||
    sortedImages.find((item) => item.isThumbnail)?.imageUrl ||
    sortedImages[0]?.imageUrl ||
    "";

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-100 to-slate-200">
        {activeImage ? (
          <>
            <img
              src={activeImage}
              alt="product"
              className="h-[360px] w-full object-cover sm:h-[440px] xl:h-[560px]"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 shadow-lg backdrop-blur">
              Product View
            </div>

            <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
              <ImageIcon />
              <span>{sortedImages.length || 1} ảnh</span>
            </div>
          </>
        ) : (
          <div className="flex h-[360px] w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-400 sm:h-[440px] xl:h-[560px]">
            No Image
          </div>
        )}
      </div>

      {hasImages && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Thư viện hình ảnh
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Chọn ảnh để xem
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
            {sortedImages.map((image, index) => {
              const isActive = activeImage === image.imageUrl;

              return (
                <button
                  key={image.id || `${image.imageUrl}-${index}`}
                  type="button"
                  onClick={() => onSelectImage(image.imageUrl)}
                  className={`group relative min-w-[92px] overflow-hidden rounded-[20px] border-2 bg-white transition duration-200 sm:min-w-0 ${
                    isActive
                      ? "border-slate-900 shadow-lg shadow-slate-200"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`thumbnail-${index + 1}`}
                    className="h-24 w-24 object-cover transition duration-300 group-hover:scale-105 sm:h-28 sm:w-full"
                  />

                  <div
                    className={`absolute inset-0 transition ${
                      isActive
                        ? "bg-slate-900/10"
                        : "bg-black/0 group-hover:bg-black/5"
                    }`}
                  />

                  <div className="absolute left-2 top-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "bg-white/90 text-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {image.isThumbnail && (
                    <div className="absolute bottom-2 left-2">
                      <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        Main
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l3.409 3.409M3.75 19.5h16.5A1.5 1.5 0 0 0 21.75 18V6A1.5 1.5 0 0 0 20.25 4.5H3.75A1.5 1.5 0 0 0 2.25 6v12A1.5 1.5 0 0 0 3.75 19.5ZM8.25 9.75h.008v.008H8.25V9.75Z"
    />
  </svg>
);

export default ProductImageGallery;