import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductDetailApi } from "../../services/productService";
import { addToCartApi } from "../../services/cartService";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductVariantSelector from "../../components/product/ProductVariantSelector";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";

const genderLabelMap = {
  MALE: "Nam",
  FEMALE: "Nữ",
  UNISEX: "Unisex",
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
            data.variants.find((item) => Number(item.stockQuantity || 0) > 0) ||
            data.variants[0];
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

    const currentColor = String(selectedVariant?.color || "")
      .trim()
      .toLowerCase();

    if (!currentColor) {
      return [...product.images].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
    }

    const exactColorImages = product.images.filter(
      (image) =>
        String(image.color || "").trim().toLowerCase() === currentColor
    );

    if (exactColorImages.length > 0) {
      return [...exactColorImages].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
    }

    const commonImages = product.images.filter(
      (image) => !String(image.color || "").trim()
    );

    return [...commonImages].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
  }, [product?.images, selectedVariant?.color]);

  useEffect(() => {
    if (!filteredImages.length) {
      setSelectedImage(product?.thumbnailUrl || "");
      return;
    }

    const stillExists = filteredImages.some(
      (image) => image.imageUrl === selectedImage
    );

    if (stillExists) return;

    const thumbnail =
      filteredImages.find((image) => image.isThumbnail) || filteredImages[0];

    setSelectedImage(thumbnail?.imageUrl || "");
  }, [filteredImages, selectedImage, product?.thumbnailUrl]);

  const maxQuantity = useMemo(() => {
    return Math.max(1, Number(selectedVariant?.stockQuantity || 1));
  }, [selectedVariant]);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

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

      setSuccessMessage("Thêm vào giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể thêm vào giỏ hàng";
      setErrorMessage(backendMessage);
    } finally {
      setCartLoading(false);
    }
  };

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
      originalPrice: hasPromotion
        ? selectedVariant.originalPrice
        : selectedVariant.price,
      finalPrice: hasPromotion
        ? selectedVariant.finalPrice
        : selectedVariant.price,
      discountPercent: selectedVariant.discountPercent || 0,
      discountAmount: selectedVariant.discountAmount || 0,
      flashSale: Boolean(selectedVariant.flashSale),
    };
  }, [selectedVariant]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (errorMessage && !product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">
            Không tìm thấy sản phẩm
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Sản phẩm này có thể đã bị xóa hoặc hiện không còn khả dụng.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 xl:px-8">
          <Breadcrumb productName={product.name} />
          <div className="mt-5 flex flex-wrap gap-2">
            <InfoPill label={product.sportName || "Sport"} />
            <InfoPill label={product.brandName || "Brand"} />
            <InfoPill label={product.isActive ? "Đang bán" : "Ngừng bán"} />
            {product.gender ? (
              <InfoPill label={genderLabelMap[product.gender] || product.gender} />
            ) : null}
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-10">
            <div className="space-y-6">
              <ProductImageGallery
                images={filteredImages}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <StatMini
                  label="Thương hiệu"
                  value={product.brandName || "Chưa cập nhật"}
                />
                <StatMini
                  label="Môn thể thao"
                  value={product.sportName || "Chưa cập nhật"}
                />
                <StatMini
                  label="Chất liệu"
                  value={product.material || "Chưa cập nhật"}
                />
              </div>
            </div>

            <div className="space-y-6">
              <ProductHeader
                product={product}
                selectedVariant={selectedVariant}
                currentPriceView={currentPriceView}
              />

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <ProductVariantSelector
                  variants={product.variants || []}
                  selectedVariant={selectedVariant}
                  onSelectVariant={setSelectedVariant}
                />
              </div>

              <PurchasePanel
                selectedVariant={selectedVariant}
                quantity={quantity}
                maxQuantity={maxQuantity}
                cartLoading={cartLoading}
                successMessage={successMessage}
                errorMessage={product ? errorMessage : ""}
                onDecrease={handleDecrease}
                onIncrease={handleIncrease}
                onAddToCart={handleAddToCart}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FeatureBox
                  title="Giao diện mua hàng rõ ràng"
                  description="Biến thể, giá, số lượng và trạng thái tồn kho được tách rõ để người dùng thao tác nhanh hơn."
                />
                <FeatureBox
                  title="Ảnh theo màu"
                  description="Thư viện ảnh tự đổi theo màu của biến thể đang chọn để trải nghiệm xem sản phẩm trực quan hơn."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 xl:px-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle
              eyebrow="Product Description"
              title="Mô tả sản phẩm"
            />
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {product.description || "Chưa có mô tả sản phẩm."}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle
              eyebrow="Product Details"
              title="Thông tin thêm"
            />
            <div className="mt-4 space-y-3">
              <InfoRow label="Tên sản phẩm" value={product.name} />
              <InfoRow
                label="Giới tính"
                value={genderLabelMap[product.gender] || product.gender || "Chưa cập nhật"}
              />
              <InfoRow
                label="Thương hiệu"
                value={product.brandName || "Chưa cập nhật"}
              />
              <InfoRow
                label="Môn thể thao"
                value={product.sportName || "Chưa cập nhật"}
              />
              <InfoRow
                label="Chất liệu"
                value={product.material || "Chưa cập nhật"}
              />
              <InfoRow
                label="Biến thể đã chọn"
                value={
                  selectedVariant
                    ? `${selectedVariant.size} • ${selectedVariant.color}`
                    : "Chưa chọn"
                }
              />
              <InfoRow
                label="SKU"
                value={selectedVariant?.sku || "Chưa cập nhật"}
              />
              <InfoRow
                label="Tồn kho"
                value={
                  selectedVariant
                    ? `${selectedVariant.stockQuantity || 0} sản phẩm`
                    : "Chưa có dữ liệu"
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Breadcrumb = ({ productName }) => (
  <div className="text-sm text-slate-500">
    <Link to="/" className="transition hover:text-slate-900">
      Trang chủ
    </Link>
    <span className="mx-2">/</span>
    <Link to="/products" className="transition hover:text-slate-900">
      Sản phẩm
    </Link>
    <span className="mx-2">/</span>
    <span className="font-medium text-slate-900">{productName}</span>
  </div>
);

const ProductHeader = ({ product, selectedVariant, currentPriceView }) => (
  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      Product Overview
    </p>

    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
      {product.name}
    </h1>

    {selectedVariant?.sku ? (
      <p className="mt-3 text-sm text-slate-500">SKU: {selectedVariant.sku}</p>
    ) : null}

    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Giá của biến thể đang chọn
      </p>

      {!selectedVariant ? (
        <p className="mt-3 text-lg font-semibold text-slate-900">
          Chưa chọn biến thể
        </p>
      ) : !currentPriceView.hasPromotion ? (
        <p className="mt-3 text-3xl font-semibold text-slate-950">
          {formatCurrency(currentPriceView.finalPrice)}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <span className="text-xl font-medium text-slate-400 line-through">
            {formatCurrency(currentPriceView.originalPrice)}
          </span>
          <span className="text-3xl font-semibold text-rose-600">
            {formatCurrency(currentPriceView.finalPrice)}
          </span>
        </div>
      )}
    </div>

    {selectedVariant?.onPromotion ? (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <InfoPill label={`Giảm ${currentPriceView.discountPercent || 0}%`} />
        {currentPriceView.flashSale ? <InfoPill label="Flash Sale" /> : null}
        {currentPriceView.discountAmount ? (
          <InfoPill
            label={`Tiết kiệm ${formatCurrency(
              currentPriceView.discountAmount
            )}`}
          />
        ) : null}
      </div>
    ) : null}

    {selectedVariant?.appliedPromotion?.promotionName ? (
      <div className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Promotion Applied
        </p>
        <h3 className="mt-2 text-base font-semibold text-slate-950">
          {selectedVariant.appliedPromotion.promotionName}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ưu đãi này đang được áp dụng cho biến thể bạn chọn.
        </p>
      </div>
    ) : null}
  </section>
);

const PurchasePanel = ({
  selectedVariant,
  quantity,
  maxQuantity,
  cartLoading,
  successMessage,
  errorMessage,
  onDecrease,
  onIncrease,
  onAddToCart,
}) => (
  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <SectionTitle eyebrow="Purchase Box" title="Mua ngay" />

    {selectedVariant ? (
      <>
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-900">Số lượng</p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onDecrease}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              -
            </button>

            <div className="inline-flex min-w-[76px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900">
              {quantity}
            </div>

            <button
              type="button"
              onClick={onIncrease}
              disabled={quantity >= maxQuantity}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Số lượng tối đa có thể mua hiện tại:{" "}
            <span className="font-semibold text-slate-900">
              {selectedVariant.stockQuantity || 0}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={cartLoading || Number(selectedVariant.stockQuantity || 0) === 0}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cartLoading
              ? "Đang thêm vào giỏ..."
              : Number(selectedVariant.stockQuantity || 0) === 0
              ? "Hết hàng"
              : "Thêm vào giỏ hàng"}
          </button>

          <Link
            to="/cart"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Xem giỏ hàng
          </Link>
        </div>

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </>
    ) : (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        Sản phẩm này hiện chưa có biến thể khả dụng để mua.
      </div>
    )}
  </section>
);

const SectionTitle = ({ eyebrow, title }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {eyebrow}
    </p>
    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
      {title}
    </h2>
  </div>
);

const FeatureBox = ({ title, description }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
  </div>
);

const InfoPill = ({ label }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
    {label}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-right text-sm font-semibold text-slate-900">
      {value}
    </span>
  </div>
);

const StatMini = ({ label, value }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
  </div>
);

const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 xl:px-8">
    <div className="mx-auto max-w-[1280px] space-y-8">
      <div className="h-5 w-60 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="aspect-[4/5] animate-pulse rounded-[28px] bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[24px] bg-slate-200"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-slate-200 p-6">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-300" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-slate-300" />
            <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-slate-300" />
          </div>

          <div className="rounded-[28px] bg-slate-200 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-300" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-[24px] bg-slate-300"
                />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-200 p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-300" />
            <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailPage;