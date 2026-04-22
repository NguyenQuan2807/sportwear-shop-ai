import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addToCartApi,
  deleteCartItemApi,
  getCartApi,
  updateCartItemApi,
} from "../../services/cartService";
import { getProductDetailApi } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import CartItemCard from "../../components/product/CartItemCard";
import CartWishlistSection from "../../components/product/CartWishlistSection";
import WishlistVariantModal from "../../components/product/WishlistVariantModal";
import { dispatchCartUpdated } from "../../utils/cartEvents";
import useWishlist from "../../hooks/useWishlist";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getDefaultColorForProduct = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants[0]?.color || "";
};

const getImagesByColor = (product, color) => {
  if (!product?.images?.length) return [];

  const exactColorImages = product.images.filter(
    (image) => normalizeText(image.color) === normalizeText(color)
  );

  const images = exactColorImages.length > 0 ? exactColorImages : product.images;
  return [...images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

const CartPage = () => {
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedWishlistProduct, setSelectedWishlistProduct] = useState(null);
  const [selectedWishlistColor, setSelectedWishlistColor] = useState("");
  const [selectedWishlistVariant, setSelectedWishlistVariant] = useState(null);
  const [selectedWishlistImage, setSelectedWishlistImage] = useState("");
  const [wishlistModalError, setWishlistModalError] = useState("");
  const [wishlistModalLoading, setWishlistModalLoading] = useState(false);
  const [wishlistDetailLoading, setWishlistDetailLoading] = useState(false);
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getCartApi();
      setCart(response.data);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải giỏ hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      setLoadingItemId(cartItemId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await updateCartItemApi(cartItemId, {
        quantity: newQuantity,
      });

      setCart(response.data);
      dispatchCartUpdated();
      setSuccessMessage("Cập nhật giỏ hàng thành công");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể cập nhật số lượng";
      setErrorMessage(backendMessage);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = (item) => {
    handleUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;
    handleUpdateQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = async (cartItemId) => {
    try {
      setDeletingItemId(cartItemId);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCartItemApi(cartItemId);
      await fetchCart();
      dispatchCartUpdated();
      setSuccessMessage("Xóa sản phẩm khỏi giỏ hàng thành công");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể xóa sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleOpenWishlistModal = async (product) => {
    setSelectedWishlistProduct(product);
    setSelectedWishlistColor("");
    setSelectedWishlistVariant(null);
    setSelectedWishlistImage(product?.thumbnailUrl || "");
    setWishlistModalError("");
    setWishlistDetailLoading(true);

    try {
      const response = await getProductDetailApi(product.id);
      const detailProduct = response?.data || null;
      const defaultColor = getDefaultColorForProduct(detailProduct);
      const defaultImages = getImagesByColor(detailProduct, defaultColor);

      setSelectedWishlistProduct(detailProduct);
      setSelectedWishlistColor(defaultColor);
      setSelectedWishlistVariant(null);
      setSelectedWishlistImage(defaultImages[0]?.imageUrl || detailProduct?.thumbnailUrl || "");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải đầy đủ biến thể sản phẩm";
      setWishlistModalError(backendMessage);
    } finally {
      setWishlistDetailLoading(false);
    }
  };

  const handleCloseWishlistModal = () => {
    setSelectedWishlistProduct(null);
    setSelectedWishlistColor("");
    setSelectedWishlistVariant(null);
    setSelectedWishlistImage("");
    setWishlistModalError("");
    setWishlistModalLoading(false);
    setWishlistDetailLoading(false);
  };

  const handleSelectWishlistColor = (color) => {
    if (!selectedWishlistProduct) return;
    const colorImages = getImagesByColor(selectedWishlistProduct, color);
    setSelectedWishlistColor(color);
    setSelectedWishlistVariant(null);
    setSelectedWishlistImage(colorImages[0]?.imageUrl || selectedWishlistProduct?.thumbnailUrl || "");
    setWishlistModalError("");
  };

  const handleConfirmAddWishlistToCart = async () => {
    if (!selectedWishlistProduct) return;

    if (!selectedWishlistVariant) {
      setWishlistModalError("Vui lòng chọn size.");
      return;
    }

    if (Number(selectedWishlistVariant.stockQuantity || 0) <= 0) {
      setWishlistModalError("Biến thể này hiện đã hết hàng.");
      return;
    }

    try {
      setWishlistModalLoading(true);
      setWishlistModalError("");
      setErrorMessage("");
      setSuccessMessage("");

      await addToCartApi({
        productVariantId: selectedWishlistVariant.id,
        quantity: 1,
      });

      await fetchCart();
      dispatchCartUpdated();
      setSuccessMessage("Đã thêm sản phẩm từ yêu thích vào giỏ hàng");
      setRecentlyAddedProductId(selectedWishlistProduct.id);
      handleCloseWishlistModal();

      window.setTimeout(() => {
        setRecentlyAddedProductId(null);
      }, 2000);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng";
      setWishlistModalError(backendMessage);
    } finally {
      setWishlistModalLoading(false);
    }
  };

  const handleGoCheckout = () => {
    navigate("/checkout");
  };

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black/50">
            <BagIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black">Giỏ hàng của bạn đang trống</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-black/55">
            Hãy thêm vài sản phẩm vào giỏ để tiếp tục mua sắm.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-4 text-sm font-semibold text-black"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
        <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-12">
          <section>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-black">Giỏ hàng</h1>
                <p className="mt-2 text-sm text-black/55">
                  {items.length} dòng sản phẩm · {totalQuantity} sản phẩm
                </p>
              </div>

              <Link
                to="/products"
                className="hidden text-sm font-semibold text-black underline underline-offset-4 xl:inline-flex"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            {successMessage ? (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-7">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                  loadingItemId={loadingItemId}
                  deletingItemId={deletingItemId}
                />
              ))}
            </div>

            <CartWishlistSection
              wishlistItems={wishlistItems}
              onOpenVariantModal={handleOpenWishlistModal}
              recentlyAddedProductId={recentlyAddedProductId}
            />
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="bg-white p-7 ring-1 ring-black/5">
              <h2 className="text-4xl font-semibold tracking-tight text-black">Sơ lược</h2>

              <div className="mt-8 space-y-5 border-b border-black/10 pb-6 text-[17px]">
                <SummaryRow label="Tổng tạm tính" value={formatCurrency(totalAmount)} />
                <SummaryRow label="Phí giao hàng" value="Free" />
              </div>

              <div className="flex items-center justify-between gap-4 py-6 text-[22px] font-semibold text-black">
                <span>Tổng giá</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              <button
                type="button"
                onClick={handleGoCheckout}
                className="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-5 text-lg font-semibold text-white transition hover:opacity-90"
              >
                Đặt hàng ngay
              </button>

              <Link
                to="/products"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-black/15 px-6 py-5 text-base font-semibold text-black transition hover:border-black"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <WishlistVariantModal
        product={selectedWishlistProduct}
        loadingData={wishlistDetailLoading}
        selectedColor={selectedWishlistColor}
        selectedVariant={selectedWishlistVariant}
        selectedImage={selectedWishlistImage}
        errorMessage={wishlistModalError}
        loading={wishlistModalLoading}
        onClose={handleCloseWishlistModal}
        onSelectColor={handleSelectWishlistColor}
        onSelectVariant={(variant) => {
          setSelectedWishlistVariant(variant);
          setWishlistModalError("");
        }}
        onSelectImage={setSelectedWishlistImage}
        onConfirm={handleConfirmAddWishlistToCart}
      />
    </>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-black/75">{label}</span>
    <span className="font-medium text-black">{value}</span>
  </div>
);

const CartPageSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_370px] xl:gap-12">
      <div>
        <div className="h-10 w-24 animate-pulse rounded bg-black/6" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-black/6" />
        <div className="mt-8 space-y-7">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border-b border-black/10 pb-7">
              <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div className="aspect-square animate-pulse rounded bg-black/6" />
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-7 w-52 animate-pulse rounded bg-black/6" />
                      <div className="h-5 w-40 animate-pulse rounded bg-black/6" />
                      <div className="h-5 w-32 animate-pulse rounded bg-black/6" />
                    </div>
                    <div className="h-7 w-28 animate-pulse rounded bg-black/6" />
                  </div>
                  <div className="h-12 w-44 animate-pulse rounded-full bg-black/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5">
        <div className="h-10 w-40 animate-pulse rounded bg-black/6" />
        <div className="mt-8 space-y-5">
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
          <div className="h-5 w-full animate-pulse rounded bg-black/6" />
        </div>
        <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-black/6" />
      </div>
    </div>
  </div>
);

const BagIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M6.75 8.25V7a5.25 5.25 0 0 1 10.5 0v1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 8.25h15l-1.2 10.8a2.25 2.25 0 0 1-2.236 2.002H7.936A2.25 2.25 0 0 1 5.7 19.05L4.5 8.25Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CartPage;
