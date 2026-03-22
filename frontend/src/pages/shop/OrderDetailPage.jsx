import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderDetailApi } from "../../services/orderService";
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
};

const statusLabelMap = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
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

  const totalQuantity = useMemo(() => {
    return (order?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [order]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
        {errorMessage}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const statusClass =
    statusClassMap[order.status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  const statusLabel = statusLabelMap[order.status] || order.status;

  return (
    <div className="space-y-8 pb-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition hover:text-slate-900">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/orders" className="transition hover:text-slate-900">
          Đơn hàng của tôi
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Đơn hàng #{order.id}</span>
      </nav>

      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 text-white shadow-2xl">
        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Order Detail
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Chi tiết đơn hàng #{order.id}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Xem thông tin nhận hàng, trạng thái xử lý và danh sách sản phẩm trong
              đơn hàng của bạn.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur ${statusClass}`}
              >
                {statusLabel}
              </span>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                {totalQuantity} sản phẩm
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickStat label="Tổng tiền" value={formatCurrency(order.totalAmount || 0)} />
              <QuickStat label="Thanh toán" value={paymentMethodLabelMap[order.paymentMethod] || order.paymentMethod || "N/A"} />
              <QuickStat label="Ngày tạo" value={formatDateTime(order.createdAt)} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Shipping Information
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Thông tin đơn hàng
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Người nhận" value={order.receiverName} />
              <InfoCard label="Số điện thoại" value={order.receiverPhone} />
              <InfoCard
                label="Phương thức thanh toán"
                value={
                  paymentMethodLabelMap[order.paymentMethod] ||
                  order.paymentMethod ||
                  "Đang cập nhật"
                }
              />
              <InfoCard label="Trạng thái" value={statusLabel} />
            </div>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Địa chỉ giao hàng
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {order.shippingAddress || "Đang cập nhật"}
              </p>
            </div>

            {order.note && (
              <div className="mt-5 rounded-[24px] border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Ghi chú
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{order.note}</p>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Order Items
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Sản phẩm trong đơn
            </h2>

            <div className="mt-6 space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black tracking-tight text-slate-900">
                          {item.productName}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Tag>{`Size ${item.size}`}</Tag>
                          <Tag>{item.color}</Tag>
                          <Tag>{`x${item.quantity}`}</Tag>
                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                          Đơn giá: {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="sm:min-w-[140px] sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Thành tiền
                      </p>
                      <p className="mt-1 text-xl font-black tracking-tight text-red-500">
                        {formatCurrency(item.totalPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="sticky top-28 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              Summary
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-6 space-y-4 rounded-[24px] bg-slate-50 p-5">
              <SummaryRow label="Mã đơn hàng" value={`#${order.id}`} />
              <SummaryRow label="Số dòng sản phẩm" value={order.items?.length || 0} />
              <SummaryRow label="Tổng số lượng" value={totalQuantity} />
              <SummaryRow label="Ngày tạo" value={formatDateTime(order.createdAt)} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-base font-semibold text-slate-600">
                Tổng cộng
              </span>
              <span className="text-2xl font-black tracking-tight text-red-500">
                {formatCurrency(order.totalAmount || 0)}
              </span>
            </div>

            <Link
              to="/orders"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
      {label}
    </p>
    <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
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

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const Tag = ({ children }) => (
  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
    {children}
  </span>
);

export default OrderDetailPage;