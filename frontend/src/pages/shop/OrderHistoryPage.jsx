import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const paymentMethodLabelMap = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const statusLabelMap = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  PAID: "Đã thanh toán",
  UNPAID: "Chưa thanh toán",
};

const formatDateTime = (value) => {
  if (!value) return "Đang cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const accountTabs = [
  { label: "Tài khoản", to: "/profile" },
  { label: "Đơn hàng", to: "/orders" },
  { label: "Yêu thích", to: "/wishlist" },
];

const OrderItemStrip = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="mt-5 w-full max-w-[420px] overflow-x-auto pb-2">
      <div className="flex w-max gap-3">
        {items.map((item, index) => (
          <div
            key={item.id || `${item.productName}-${index}`}
            className="w-[96px] shrink-0 snap-start"
          >
            <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
              {item.thumbnailUrl ? (
                <img
                  src={resolveImageUrl(item.thumbnailUrl)}
                  alt={item.productName || `Order item ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-black/35">
                  No image
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-black/55">
              {item.productName || "Sản phẩm"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getMyOrdersApi();
      setOrders(Array.isArray(response?.data) ? response.data : []);
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

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order?.totalAmount || 0), 0);
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <section>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div>
            <h1 className="text-[44px] font-medium tracking-tight text-black">Đơn hàng</h1>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-8 text-[16px] lg:justify-center">
            {accountTabs.map((tab) => {
              const sharedClassName =
                tab.label === "Đơn hàng"
                  ? "font-medium text-black"
                  : "font-medium text-black/55 transition hover:text-black";

              if (tab.disabled) {
                return (
                  <span key={tab.label} className={sharedClassName}>
                    {tab.label}
                  </span>
                );
              }

              return (
                <Link key={tab.label} to={tab.to} className={sharedClassName}>
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div />
        </div>

        <div className="mt-5 border-b border-black/10" />
      </section>

      {loading ? (
        <div className="py-14">
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b border-black/10 pb-5">
                <div className="h-5 w-40 animate-pulse rounded bg-black/10" />
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="h-4 animate-pulse rounded bg-black/10" />
                  <div className="h-4 animate-pulse rounded bg-black/10" />
                  <div className="h-4 animate-pulse rounded bg-black/10" />
                </div>
                <div className="mt-5 w-full max-w-[420px] overflow-hidden">
                  <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((__, itemIndex) => (
                      <div key={itemIndex} className="h-24 w-24 shrink-0 animate-pulse rounded bg-black/10" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : errorMessage ? (
        <div className="py-14 text-center text-[18px] text-red-600">{errorMessage}</div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[420px] items-start justify-center pt-16 text-center">
          <p className="text-[18px] text-black/55">Bạn chưa có đơn hàng nào!</p>
        </div>
      ) : (
        <div className="py-10">
          <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] text-black/65">
            <span>{orders.length} Đơn hàng</span>
            <span>Tổng chi tiêu: {formatCurrency(totalSpent)}</span>
          </div>

          <div className="space-y-0 border-t border-black/10">
            {orders.map((order) => (
              <article key={order.id} className="border-b border-black/10 py-6">
                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_220px] lg:items-start">
                  <div>
                    <p className="text-[14px] font-medium text-black">Đơn hàng #{order.id}</p>
                    <p className="mt-1 text-[15px] text-black/55">
                      {statusLabelMap[order.status] || order.status || "Đang cập nhật"}
                    </p>
                    <p className="mt-3 text-[15px] leading-7 text-black/70">
                      {order.shippingAddress || "Đang cập nhật địa chỉ giao hàng"}
                    </p>

                    <OrderItemStrip items={order.items || []} />
                  </div>

                  <div className="space-y-1 text-[15px] text-black/65">
                    <p>
                      <span className="text-black">Ngày tạo:</span> {formatDateTime(order.createdAt)}
                    </p>
                    <p>
                      <span className="text-black">Phương thức thanh toán:</span>{" "}
                      {paymentMethodLabelMap[order.paymentMethod] ||
                        order.paymentMethod ||
                        "Đang cập nhật"}
                    </p>
                    <p>
                      <span className="text-black">Người nhận:</span> {order.receiverName || "Đang cập nhật"}
                    </p>
                    <p>
                      <span className="text-black">Mặt hàng:</span> {order.items?.length || 0}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-4 lg:items-end">
                    <p className="text-[20px] font-medium text-black">
                      {formatCurrency(order.totalAmount || 0)}
                    </p>
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-black/15 px-5 py-3 text-[15px] font-medium text-black transition hover:border-black"
                    >
                      Chi tiết đơn hàng
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
