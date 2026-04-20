import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderDetailApi } from "../../services/orderService";
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
};

const statusToneMap = {
  PENDING: "text-amber-600",
  CONFIRMED: "text-sky-600",
  SHIPPING: "text-blue-600",
  DELIVERED: "text-emerald-600",
  CANCELLED: "text-red-600",
};

const accountTabs = [
  { label: "Profile", disabled: true },
  { label: "Orders", to: "/orders" },
  { label: "Favourites", to: "/wishlist" },
  { label: "Settings", disabled: true },
];

const formatDateTime = (value) => {
  if (!value) return "Đang cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-black/10 py-4 text-[15px]">
    <span className="text-black/55">{label}</span>
    <span className="max-w-[65%] text-right font-medium text-black">{value || "Đang cập nhật"}</span>
  </div>
);

const SummaryRow = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between gap-4 text-[15px]">
    <span className={strong ? "font-medium text-black" : "text-black/55"}>{label}</span>
    <span className={strong ? "text-[22px] font-medium text-black" : "font-medium text-black"}>{value}</span>
  </div>
);

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
    return (order?.items || []).reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  }, [order]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <section>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div>
            <h1 className="text-[44px] font-medium tracking-tight text-black">Orders</h1>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-8 text-[16px] lg:justify-center">
            {accountTabs.map((tab) => {
              const sharedClassName =
                tab.label === "Orders"
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
        <div className="py-10">
          <div className="h-8 w-56 animate-pulse rounded bg-black/10" />
          <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-6 animate-pulse rounded bg-black/10" />
                ))}
              </div>
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded bg-black/10" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-6 animate-pulse rounded bg-black/10" />
              ))}
            </div>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="py-12 text-center text-[18px] text-red-600">{errorMessage}</div>
      ) : !order ? (
        <div className="py-14 text-center text-[18px] text-black/55">Không tìm thấy đơn hàng.</div>
      ) : (
        <div className="py-10">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link to="/orders" className="text-[14px] text-black/55 transition hover:text-black">
                ← Back to orders
              </Link>
              <h2 className="mt-3 text-[36px] font-medium tracking-tight text-black">
                Order #{order.id}
              </h2>
              <p className="mt-2 text-[16px] text-black/55">Created {formatDateTime(order.createdAt)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[15px]">
              <span className={`font-medium ${statusToneMap[order.status] || "text-black"}`}>
                {statusLabelMap[order.status] || order.status || "Đang cập nhật"}
              </span>
              <span className="text-black/55">{totalQuantity} items</span>
            </div>
          </div>

          <div className="grid gap-12 pt-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <section className="border-b border-black/10 pb-10">
                <h3 className="text-[22px] font-medium text-black">Order details</h3>
                <div className="mt-6">
                  <DetailRow label="Recipient" value={order.receiverName} />
                  <DetailRow label="Phone" value={order.receiverPhone} />
                  <DetailRow
                    label="Payment"
                    value={
                      paymentMethodLabelMap[order.paymentMethod] ||
                      order.paymentMethod ||
                      "Đang cập nhật"
                    }
                  />
                  <DetailRow
                    label="Shipping address"
                    value={order.shippingAddress || "Đang cập nhật"}
                  />
                  {order.note ? <DetailRow label="Note" value={order.note} /> : null}
                </div>
              </section>

              <section className="pt-10">
                <h3 className="text-[22px] font-medium text-black">Items</h3>
                <div className="mt-6 border-t border-black/10">
                  {(order.items || []).map((item, index) => (
                    <article
                      key={item.id || `${item.productName}-${index}`}
                      className="grid gap-5 border-b border-black/10 py-6 md:grid-cols-[140px_minmax(0,1fr)_160px] md:items-start"
                    >
                      <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
                        {item.thumbnailUrl ? (
                          <img
                            src={resolveImageUrl(item.thumbnailUrl)}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
                            No image
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[20px] font-medium leading-7 text-black">
                          {item.productName}
                        </h4>
                        <div className="mt-2 space-y-1 text-[15px] text-black/55">
                          <p>Size {item.size || "N/A"}</p>
                          <p>{item.color || "Đang cập nhật màu"}</p>
                          <p>Quantity {item.quantity || 0}</p>
                          <p>Unit price {formatCurrency(item.price || 0)}</p>
                        </div>
                      </div>

                      <div className="md:text-right">
                        <p className="text-[14px] text-black/45">Total</p>
                        <p className="mt-1 text-[22px] font-medium text-black">
                          {formatCurrency(item.totalPrice || 0)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside>
              <div className="xl:sticky xl:top-28 p-7 ring-1 ring-black/5">
                <h3 className="text-[22px] font-medium text-black">Summary</h3>
                <div className="mt-6 space-y-5 border-t border-black/10 pt-5">
                  <SummaryRow label="Order number" value={`#${order.id}`} />
                  <SummaryRow label="Items" value={order.items?.length || 0} />
                  <SummaryRow label="Total quantity" value={totalQuantity} />
                  <SummaryRow
                    label="Payment"
                    value={
                      paymentMethodLabelMap[order.paymentMethod] ||
                      order.paymentMethod ||
                      "Đang cập nhật"
                    }
                  />
                  <div className="border-t border-black/10 pt-5">
                    <SummaryRow
                      label="Total"
                      value={formatCurrency(order.totalAmount || 0)}
                      strong
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
