import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteCartItemApi,
  getCartApi,
  updateCartItemApi,
} from "../../services/cartService";
import { formatCurrency } from "../../utils/formatCurrency";
import CartItemCard from "../../components/product/CartItemCard";

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getCartApi();
      setCart(response.data);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải giỏ hàng";
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
      setSuccessMessage("Cập nhật giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể cập nhật số lượng";
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

      setSuccessMessage("Xóa sản phẩm khỏi giỏ hàng thành công");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleGoCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Đang tải giỏ hàng...
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Giỏ hàng của bạn</h1>
        <p className="mt-2 text-slate-500">
          Kiểm tra sản phẩm trước khi tiến hành đặt hàng
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-green-100 p-4 text-green-700 shadow">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-slate-500">Giỏ hàng của bạn đang trống.</p>
          <Link
            to="/products"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
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

          <div className="h-fit rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-slate-800">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 border-b border-slate-200 pb-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Số sản phẩm</span>
                <span>{items.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 text-lg font-bold text-slate-800">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              type="button"
              onClick={handleGoCheckout}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;