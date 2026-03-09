import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getMyOrdersApi();
      setOrders(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        Đang tải đơn hàng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Đơn hàng của tôi</h1>
        <p className="mt-2 text-slate-500">
          Theo dõi các đơn hàng bạn đã đặt
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-500">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Đơn hàng #{order.id}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>Người nhận: {order.receiverName}</span>
                    <span>SĐT: {order.receiverPhone}</span>
                    <span>Thanh toán: {order.paymentMethod}</span>
                  </div>

                  <p className="text-sm text-slate-500">
                    Địa chỉ: {order.shippingAddress}
                  </p>
                </div>

                <div className="space-y-2 text-right">
                  <p className="font-bold text-blue-600">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {order.status}
                  </span>

                  <p className="text-xs text-slate-400">{order.createdAt}</p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/orders/${order.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;