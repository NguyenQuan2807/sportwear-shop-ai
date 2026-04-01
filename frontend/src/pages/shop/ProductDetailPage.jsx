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

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getProductDetailApi(id);
      const data = response.data;

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

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setSuccessMessage("");
  }, [selectedVariant]);

  const filteredImages = useMemo(() => {
  if (!product?.images?.length) return [];

  const currentColor = String(selectedVariant?.color || "").trim().toLowerCase();

  if (!currentColor) {
    return [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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

  if (stillExists) {
    return;
  }

  const thumbnail =
    filteredImages.find((image) => image.isThumbnail) || filteredImages[0];

  setSelectedImage(thumbnail?.imageUrl || "");
  }, [filteredImages, selectedImage, product?.thumbnailUrl]);

  const maxQuantity = useMemo(() => {
    return selectedVariant?.stockQuantity || 1;
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

  const renderSelectedVariantPrice = () => {
    if (!selectedVariant) return null;

    const hasPromotion = Boolean(selectedVariant.onPromotion);

    if (!hasPromotion) {
      return (
        <p className="text-3xl font-black tracking-tight text-slate-900">
          {formatCurrency(selectedVariant.price)}
        </p>
      );
    }

    return (
      <div className="space-y-1">
        <p className="text-base font-medium text-slate-400 line-through">
          {formatCurrency(selectedVariant.originalPrice)}
        </p>
        <p className="text-3xl font-black tracking-tight text-red-500">
          {formatCurrency(selectedVariant.finalPrice)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-[520px] animate-pulse rounded-[24px] bg-slate-200" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 h-32 animate-pulse rounded-[24px] bg-slate-200" />
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-56 animate-pulse rounded-[24px] bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
        {errorMessage}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition hover:text-slate-900">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/products" className="transition hover:text-slate-900">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-200/50">
            <ProductImageGallery
              images={filteredImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureBox
              title="Chính hãng"
              description="Sản phẩm được quản lý và hiển thị đầy đủ thông tin."
            />
            <FeatureBox
              title="Giao nhanh"
              description="Hỗ trợ quy trình đặt hàng và thanh toán tiện lợi."
            />
            <FeatureBox
              title="Hỗ trợ AI"
              description="Sắp tới có chatbot tư vấn sản phẩm theo nhu cầu."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                {product.sportName || "Sport"}
              </span>

              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
                {product.brandName || "Brand"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                  product.isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.isActive ? "Đang bán" : "Ngừng bán"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <InfoPill label={product.categoryName || "Danh mục"} />
              <InfoPill label={genderLabelMap[product.gender] || product.gender} />
              {selectedVariant?.sku && <InfoPill label={`SKU: ${selectedVariant.sku}`} />}
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Giá của biến thể đang chọn
                  </p>
                  <div className="mt-2">{renderSelectedVariantPrice()}</div>

                  {selectedVariant?.onPromotion && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">
                        Giảm {selectedVariant.discountPercent || 0}%
                      </span>

                      {selectedVariant?.flashSale && (
                        <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                          Flash Sale
                        </span>
                      )}
                    </div>
                  )}

                  {selectedVariant?.onPromotion && (
                    <p className="mt-3 text-sm font-semibold text-red-500">
                      Bạn tiết kiệm{" "}
                      {formatCurrency(selectedVariant.discountAmount || 0)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                  <StatMini
                    label="Tồn kho"
                    value={selectedVariant?.stockQuantity ?? 0}
                  />
                  <StatMini
                    label="Biến thể"
                    value={product.variants?.length || 0}
                  />
                </div>
              </div>
            </div>

            {selectedVariant?.appliedPromotion?.promotionName && (
              <div className="mt-5 rounded-[24px] border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                  Promotion Applied
                </p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                  {selectedVariant.appliedPromotion.promotionName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ưu đãi này đang được áp dụng cho biến thể bạn chọn.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] border border-slate-200 p-5">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Mô tả sản phẩm
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {product.description || "Chưa có mô tả sản phẩm."}
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 p-5">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Thông tin thêm
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Chất liệu" value={product.material || "Đang cập nhật"} />
                  <InfoRow
                    label="Danh mục"
                    value={product.categoryName || "Đang cập nhật"}
                  />
                  <InfoRow
                    label="Thương hiệu"
                    value={product.brandName || "Đang cập nhật"}
                  />
                  <InfoRow
                    label="Giới tính"
                    value={genderLabelMap[product.gender] || product.gender || "Đang cập nhật"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <ProductVariantSelector
              variants={product.variants || []}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />

            {selectedVariant && (
              <div className="mt-6 rounded-[28px] bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Số lượng</p>

                    <div className="mt-3 inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={handleDecrease}
                        className="px-5 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="min-w-[60px] px-4 text-center text-base font-bold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrease}
                        className="px-5 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                      Số lượng tối đa có thể mua hiện tại:{" "}
                      <span className="font-semibold text-slate-900">
                        {selectedVariant.stockQuantity}
                      </span>
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={cartLoading || selectedVariant.stockQuantity === 0}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cartLoading
                        ? "Đang thêm vào giỏ..."
                        : selectedVariant.stockQuantity === 0
                        ? "Hết hàng"
                        : "Thêm vào giỏ hàng"}
                    </button>

                    <Link
                      to="/cart"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Xem giỏ hàng
                    </Link>
                  </div>
                </div>

                {successMessage && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </div>
                )}

                {errorMessage && product && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureBox = ({ title, description }) => (
  <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
    <p className="text-sm font-black tracking-tight text-slate-900">{title}</p>
    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

const InfoPill = ({ label }) => (
  <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
    {label}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

const StatMini = ({ label, value }) => (
  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/60">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-lg font-black tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);

export default ProductDetailPage;