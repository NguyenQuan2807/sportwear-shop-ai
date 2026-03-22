import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

const paymentMethodLabelMap = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const statusClassMap = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-200",
  SHIPPING: "bg-sky-50 text-sky-600 border-sky-200",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  UNPAID: "bg-slate-100 text-slate-600 border-slate-200",
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

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 text-white shadow-2xl">
        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              My Orders
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Đơn hàng của tôi
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Theo dõi toàn bộ đơn hàng đã đặt, trạng thái xử lý và thông tin giao
              nhận của bạn trên một giao diện hiện đại, responsive.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                {orders.length} đơn hàng
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                Tổng chi tiêu: {formatCurrency(totalSpent)}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickStat label="Đơn hàng" value={orders.length} />
              <QuickStat
                label="Đã giao"
                value={orders.filter((item) => item.status === "DELIVERED").length}
              />
              <QuickStat
                label="Đang xử lý"
                value={
                  orders.filter((item) =>
                    ["PENDING", "CONFIRMED", "SHIPPING"].includes(item.status)
                  ).length
                }
              />
            </div>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {errorMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <section className="rounded-[32px] border border-slate-200/70 bg-white px-6 py-12 text-center shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <OrderIcon />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
            Bạn chưa có đơn hàng nào
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Hãy khám phá các sản phẩm thể thao nổi bật và đặt đơn hàng đầu tiên của
            bạn.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Xem sản phẩm
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Về trang chủ
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusClass =
              statusClassMap[order.status] ||
              "bg-slate-100 text-slate-600 border-slate-200";

            const statusLabel = statusLabelMap[order.status] || order.status;

            return (
              <article
                key={order.id}
                className="rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Order #{order.id}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                      Đơn hàng #{order.id}
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <InfoCard label="Người nhận" value={order.receiverName} />
                      <InfoCard label="Số điện thoại" value={order.receiverPhone} />
                      <InfoCard
                        label="Thanh toán"
                        value={
                          paymentMethodLabelMap[order.paymentMethod] ||
                          order.paymentMethod ||
                          "Đang cập nhật"
                        }
                      />
                    </div>

                    <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Địa chỉ giao hàng
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {order.shippingAddress || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full lg:max-w-[260px]">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Tổng thanh toán
                      </p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-red-500">
                        {formatCurrency(order.totalAmount || 0)}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        Ngày tạo: {formatDateTime(order.createdAt)}
                      </p>

                      <Link
                        to={`/orders/${order.id}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Xem chi tiết đơn hàng
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
      {label}
    </p>
    <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-800">
      {value || "Đang cập nhật"}
    </p>
  </div>
);

const OrderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-9 w-9"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 3.75h9M8.25 3.75A2.25 2.25 0 0 0 6 6v12a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 18V6a2.25 2.25 0 0 0-2.25-2.25M8.25 3.75h7.5M8.25 8.25h7.5m-7.5 4.5h7.5m-7.5 4.5h4.5"
    />
  </svg>
);

export default OrderHistoryPage;