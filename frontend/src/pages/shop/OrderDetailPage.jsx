import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetailApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

const OrderDetailPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getOrderDetailApi(id);
      setOrder(response.data);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
        {errorMessage}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-500 shadow">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-slate-800">
          Chi tiết đơn hàng #{order.id}
        </h1>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2">
          <p><strong>Người nhận:</strong> {order.receiverName}</p>
          <p><strong>Số điện thoại:</strong> {order.receiverPhone}</p>
          <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
          <p><strong>Thanh toán:</strong> {order.paymentMethod}</p>
          <p><strong>Trạng thái:</strong> {order.status}</p>
          <p><strong>Ngày tạo:</strong> {order.createdAt}</p>
        </div>

        {order.note && (
          <div className="mt-4 rounded-xl bg-slate-100 p-4 text-slate-700">
            <strong>Ghi chú:</strong> {order.note}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-800">Sản phẩm trong đơn</h2>

        <div className="space-y-4">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-semibold text-slate-800">{item.productName}</h3>
                <p className="text-sm text-slate-500">
                  Size: {item.size} | Màu: {item.color}
                </p>
                <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">
                  Đơn giá: {formatCurrency(item.price)}
                </p>
                <p className="font-bold text-blue-600">
                  {formatCurrency(item.totalPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-800">
          <span>Tổng cộng</span>
          <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;