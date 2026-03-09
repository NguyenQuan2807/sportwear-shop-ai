const ProductImageGallery = ({ images = [], selectedImage, onSelectImage }) => {
  const displayImages = images.length > 0 ? images : [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="product"
            className="h-[420px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[420px] items-center justify-center bg-slate-100 text-slate-400">
            No Image
          </div>
        )}
      </div>

      {displayImages.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {displayImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelectImage(image.imageUrl)}
              className={`overflow-hidden rounded-xl border-2 ${
                selectedImage === image.imageUrl
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <img
                src={image.imageUrl}
                alt="thumbnail"
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;