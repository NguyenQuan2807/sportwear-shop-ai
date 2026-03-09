import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCartApi } from "../../services/cartService";
import { createOrderApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    shippingAddress: "",
    receiverName: "",
    receiverPhone: "",
    note: "",
    paymentMethod: "COD",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!cart?.items || cart.items.length === 0) {
      setErrorMessage("Giỏ hàng đang trống");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await createOrderApi(formData);

      setSuccessMessage("Đặt hàng thành công");

      setTimeout(() => {
        navigate("/orders");
      }, 1200);

      return response.data;
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tạo đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Đang tải thông tin thanh toán...
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-slate-500">Giỏ hàng đang trống, không thể thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <form
          onSubmit={handleSubmitOrder}
          className="space-y-6 rounded-2xl bg-white p-6 shadow"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Thanh toán</h1>
            <p className="mt-2 text-slate-500">
              Vui lòng điền thông tin nhận hàng để hoàn tất đơn hàng
            </p>
          </div>

          {successMessage && (
            <div className="rounded-xl bg-green-100 p-4 text-green-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-red-100 p-4 text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tên người nhận
              </label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                placeholder="Nhập tên người nhận"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Số điện thoại
              </label>
              <input
                type="text"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Địa chỉ giao hàng
              </label>
              <input
                type="text"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Ghi chú cho đơn hàng"
                rows="4"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phương thức thanh toán
              </label>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-400">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                  />
                  <div>
                    <p className="font-medium text-slate-800">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-sm text-slate-500">
                      Thanh toán trực tiếp khi đơn hàng được giao tới
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 opacity-60">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={formData.paymentMethod === "VNPAY"}
                    onChange={handleChange}
                    disabled
                  />
                  <div>
                    <p className="font-medium text-slate-800">VNPay</p>
                    <p className="text-sm text-slate-500">
                      Sẽ tích hợp ở giai đoạn sau
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </form>
      </div>

      <div className="h-fit rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          Đơn hàng của bạn
        </h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">{item.productName}</h3>
                <p className="text-sm text-slate-500">
                  Size: {item.size} | Màu: {item.color}
                </p>
                <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
              </div>

              <p className="font-semibold text-slate-800">
                {formatCurrency(item.totalPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Số sản phẩm</span>
            <span>{items.length}</span>
          </div>

          <div className="flex items-center justify-between text-lg font-bold text-slate-800">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;