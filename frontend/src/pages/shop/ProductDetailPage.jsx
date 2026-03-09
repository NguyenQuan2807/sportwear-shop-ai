import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetailApi } from "../../services/productService";
import { addToCartApi } from "../../services/cartService";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductVariantSelector from "../../components/product/ProductVariantSelector";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";

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
        setSelectedVariant(data.variants[0]);
      }

      if (data?.images?.length > 0) {
        const sortedImages = [...data.images].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        const thumbnail =
          sortedImages.find((item) => item.isThumbnail) || sortedImages[0];
        setSelectedImage(thumbnail?.imageUrl || "");
      } else {
        setSelectedImage(data?.thumbnailUrl || "");
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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
        {errorMessage}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-500 shadow">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductImageGallery
          images={product.images || []}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase text-blue-600">
              {product.sportName}
            </p>

            <h1 className="text-3xl font-bold text-slate-800">{product.name}</h1>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span>Brand: {product.brandName}</span>
              <span>Category: {product.categoryName}</span>
              <span>Gender: {product.gender}</span>
            </div>

            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  product.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {product.isActive ? "Đang bán" : "Ngừng bán"}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-2 text-lg font-semibold text-slate-800">
              Mô tả sản phẩm
            </h2>
            <p className="leading-7 text-slate-600">
              {product.description || "Chưa có mô tả sản phẩm."}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-2 text-lg font-semibold text-slate-800">
              Thông tin thêm
            </h2>
            <p className="text-slate-600">
              Chất liệu: {product.material || "Đang cập nhật"}
            </p>
          </div>

          <ProductVariantSelector
            variants={product.variants || []}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />

          {selectedVariant && (
            <div className="rounded-xl bg-white p-5 shadow">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Giá đang chọn</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedVariant.price)}
                  </p>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p>Tồn kho: {selectedVariant.stockQuantity}</p>
                  <p>SKU: {selectedVariant.sku}</p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Số lượng:
                </span>

                <div className="flex items-center overflow-hidden rounded-lg border border-slate-300">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="px-4 py-2 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="px-4 py-2 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {successMessage && (
                <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              {errorMessage && product && (
                <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading || selectedVariant.stockQuantity === 0}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cartLoading
                  ? "Đang thêm vào giỏ..."
                  : selectedVariant.stockQuantity === 0
                  ? "Hết hàng"
                  : "Thêm vào giỏ hàng"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;