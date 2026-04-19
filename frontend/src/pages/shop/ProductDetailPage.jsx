import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToCartApi } from "../../services/cartService";
import { getProductDetailApi } from "../../services/productService";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductVariantSelector from "../../components/product/ProductVariantSelector";
import RelatedProductsSection from "../../components/product/RelatedProductsSection";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";
import useWishlist from "../../hooks/useWishlist";
import { dispatchCartUpdated } from "../../utils/cartEvents";


const genderLabelMap = {
  MALE: "Men's",
  FEMALE: "Women's",
  UNISEX: "Unisex",
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/10 py-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[28px] font-medium tracking-tight text-black">{title}</span>
        <span className={`text-xl transition ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open ? <div className="pt-4 text-base leading-8 text-black/72">{children}</div> : null}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { isWishlisted, toggleWishlist } = useWishlist(product);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getProductDetailApi(id);
        const data = response?.data || null;
        setProduct(data);

        if (data?.variants?.length > 0) {
          const defaultVariant =
            data.variants.find((item) => Number(item.stockQuantity || 0) > 0) || data.variants[0];
          setSelectedVariant(defaultVariant);
        } else {
          setSelectedVariant(null);
        }
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message || "Không thể tải chi tiết sản phẩm";
        setErrorMessage(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setSuccessMessage("");
  }, [selectedVariant]);

  const filteredImages = useMemo(() => {
    if (!product?.images?.length) return [];

    const currentColor = normalizeText(selectedVariant?.color);

    if (!currentColor) {
      return [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    const exactColorImages = product.images.filter(
      (image) => normalizeText(image.color) === currentColor
    );

    if (exactColorImages.length > 0) {
      return [...exactColorImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    return [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [product?.images, selectedVariant?.color]);

  useEffect(() => {
    if (!filteredImages.length) {
      setSelectedImage(product?.thumbnailUrl || "");
      return;
    }

    const stillExists = filteredImages.some((image) => image.imageUrl === selectedImage);
    if (stillExists) return;

    const thumbnail = filteredImages.find((image) => image.isThumbnail) || filteredImages[0];
    setSelectedImage(thumbnail?.imageUrl || "");
  }, [filteredImages, product?.thumbnailUrl, selectedImage]);

  const colorOptions = useMemo(() => {
    if (!product?.variants?.length) return [];

    const uniqueColors = Array.from(
      new Set(
        product.variants
          .map((variant) => String(variant.color || "").trim())
          .filter(Boolean)
      )
    );

    return uniqueColors.map((color) => {
      const matchedImage = product.images?.find(
        (image) => normalizeText(image.color) === normalizeText(color)
      ) || product.images?.[0];

      return {
        color,
        imageUrl: matchedImage?.imageUrl || product.thumbnailUrl,
      };
    });
  }, [product?.variants, product?.images, product?.thumbnailUrl]);

  const maxQuantity = useMemo(() => Math.max(1, Number(selectedVariant?.stockQuantity || 1)), [selectedVariant]);

  const currentPriceView = useMemo(() => {
    if (!selectedVariant) {
      return {
        hasPromotion: false,
        originalPrice: null,
        finalPrice: null,
        discountPercent: 0,
        discountAmount: 0,
        flashSale: false,
      };
    }

    const hasPromotion = Boolean(selectedVariant.onPromotion);

    return {
      hasPromotion,
      originalPrice: hasPromotion ? selectedVariant.originalPrice : selectedVariant.price,
      finalPrice: hasPromotion ? selectedVariant.finalPrice : selectedVariant.price,
      discountPercent: selectedVariant.discountPercent || 0,
      discountAmount: selectedVariant.discountAmount || 0,
      flashSale: Boolean(selectedVariant.flashSale),
    };
  }, [selectedVariant]);

  const detailBullets = useMemo(
    () => [
      selectedVariant?.color ? `Màu đang chọn: ${selectedVariant.color}` : null,
      product?.material ? `Chất liệu: ${product.material}` : null,
      product?.sportName ? `Môn thể thao: ${product.sportName}` : null,
    ].filter(Boolean),
    [product?.material, product?.sportName, selectedVariant?.color, selectedVariant?.sku]
  );

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedVariant) {
      setErrorMessage("Vui lòng chọn biến thể sản phẩm");
      return;
    }

    if (Number(selectedVariant.stockQuantity || 0) <= 0) {
      setErrorMessage("Biến thể này hiện đã hết hàng");
      return;
    }

    try {
      setCartLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await addToCartApi({
        productVariantId: selectedVariant.id,
        quantity,
      });
      dispatchCartUpdated();
      setSuccessMessage("Thêm vào giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng";
      setErrorMessage(backendMessage);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (errorMessage && !product) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 px-6 py-5 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white px-8 py-10 text-center">
          <h2 className="text-2xl font-semibold text-black">Không tìm thấy sản phẩm</h2>
          <p className="mt-3 text-sm text-black/60">Sản phẩm này có thể đã bị xóa hoặc không còn khả dụng.</p>
          <Link to="/products" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black">
      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_450px]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <ProductImageGallery
              images={filteredImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              badgeLabel={currentPriceView.hasPromotion ? "Highly Rated" : "Best Seller"}
            />
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-[42px] font-semibold leading-tight tracking-tight text-black">
                {product.name}
              </h1>
              <p className="mt-2 text-[28px] leading-9 text-black/65">
                {`${genderLabelMap[product.gender] || ""} ${product.sportName || ""}`.trim()}
              </p>

              <div className="mt-5 space-y-2">
                {!currentPriceView.hasPromotion ? (
                  <p className="text-[34px] font-semibold tracking-tight text-black">
                    {formatCurrency(currentPriceView.finalPrice)}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[34px] font-semibold tracking-tight text-black">
                      {formatCurrency(currentPriceView.finalPrice)}
                    </span>
                    <span className="pb-1 text-lg text-black/35 line-through">
                      {formatCurrency(currentPriceView.originalPrice)}
                    </span>
                    <span className="pb-1 text-base font-semibold text-green-600">
                      Giảm giá {currentPriceView.discountPercent || 0}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <ProductVariantSelector
              variants={product.variants || []}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              colorOptions={colorOptions}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading || Number(selectedVariant?.stockQuantity || 0) === 0}
                className="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-5 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cartLoading
                  ? "Đang thêm vào giỏ..."
                  : Number(selectedVariant?.stockQuantity || 0) === 0
                  ? "Hết hàng"
                  : "Thêm vào giỏ hàng"}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="inline-flex w-full items-center justify-center rounded-full border border-black/20 bg-transparent px-6 py-5 text-lg font-semibold text-black transition hover:border-black"
              >
                {isWishlisted ? "Đã yêu thích" : "Yêu thích ♡"}
              </button>
            </div>

            {successMessage ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {detailBullets.length > 0 ? (
              <ul className="space-y-2 pl-5 text-[18px] leading-8 text-black/78">
                {detailBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            <div className="border-t border-black/10">
              <AccordionItem title="Chi tiết sản phẩm" defaultOpen>
                <div className="space-y-2">
                  <p>{product.description || "Chưa có mô tả sản phẩm."}</p>
                  <p>Danh mục: {product.categoryName || "Chưa cập nhật"}</p>
                  <p>Thương hiệu: {product.brandName || "Chưa cập nhật"}</p>
                  <p>Tồn kho hiện tại: {selectedVariant?.stockQuantity || 0}</p>
                </div>
              </AccordionItem>

              <AccordionItem title="Reviews">
                <p>
                  .......
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </section>

      <RelatedProductsSection
        productId={product.id}
        categoryId={product.categoryId}
        sportId={product.sportId}
      />
    </div>
  );
};

const ProductDetailSkeleton = () => (
  <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-4 lg:grid-cols-[64px_minmax(0,1fr)]">
        <div className="flex gap-3 lg:flex-col">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-16 w-16 animate-pulse rounded-lg bg-black/6 lg:h-[74px] lg:w-[74px]" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-2xl bg-black/6 sm:h-[560px] xl:h-[680px]" />
      </div>

      <div className="space-y-6">
        <div className="h-10 w-3/4 animate-pulse rounded bg-black/6" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-black/6" />
        <div className="h-9 w-1/3 animate-pulse rounded bg-black/6" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-black/6" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-[62px] animate-pulse rounded-md bg-black/6" />
          ))}
        </div>
        <div className="h-16 w-full animate-pulse rounded-full bg-black/6" />
        <div className="h-16 w-full animate-pulse rounded-full bg-black/6" />
      </div>
    </div>
  </div>
);

export default ProductDetailPage;
