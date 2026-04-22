import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReviewModal from "../../components/review/ReviewModal";
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
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusToneMap = {
  PENDING: "text-amber-600",
  CONFIRMED: "text-sky-600",
  SHIPPING: "text-blue-600",
  DELIVERED: "text-emerald-600",
  COMPLETED: "text-green-700",
  CANCELLED: "text-red-600",
};

const accountTabs = [
  { label: "Tài khoản", to: "/account" },
  { label: "Đơn hàng", to: "/orders" },
  { label: "Yêu thích", to: "/wishlist" },
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
    <span className="max-w-[65%] text-right font-medium text-black">
      {value || "Đang cập nhật"}
    </span>
  </div>
);

const SummaryRow = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between gap-4 text-[15px]">
    <span className={strong ? "font-medium text-black" : "text-black/55"}>
      {label}
    </span>
    <span
      className={
        strong ? "text-[22px] font-medium text-black" : "font-medium text-black"
      }
    >
      {value}
    </span>
  </div>
);

const OrderDetailPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewingItem, setReviewingItem] = useState(null);

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
    return (order?.items || []).reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    );
  }, [order]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <section>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div>
            <h1 className="text-[44px] font-medium tracking-tight text-black"></h1>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-8 text-[16px] lg:justify-center">
            {accountTabs.map((tab) => {
              const sharedClassName =
                tab.to === "/orders"
                  ? "font-medium text-black"
                  : "font-medium text-black/55 transition hover:text-black";

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
                  <div
                    key={index}
                    className="h-6 animate-pulse rounded bg-black/10"
                  />
                ))}
              </div>
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded bg-black/10"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-6 animate-pulse rounded bg-black/10"
                />
              ))}
            </div>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="py-12 text-center text-[18px] text-red-600">
          {errorMessage}
        </div>
      ) : !order ? (
        <div className="py-14 text-center text-[18px] text-black/55">
          Không tìm thấy đơn hàng.
        </div>
      ) : (
        <div className="py-10">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                to="/orders"
                className="text-[14px] text-black/55 transition hover:text-black"
              >
                ← Quay lại danh sách đơn hàng
              </Link>
              <h2 className="mt-3 text-[36px] font-medium tracking-tight text-black">
                Đơn hàng #{order.id}
              </h2>
              <p className="mt-2 text-[16px] text-black/55">
                Ngày tạo {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[15px]">
              <span
                className={`font-medium ${
                  statusToneMap[order.status] || "text-black"
                }`}
              >
                {statusLabelMap[order.status] || order.status || "Đang cập nhật"}
              </span>
              <span className="text-black/55">{totalQuantity} Mặt hàng</span>
            </div>
          </div>

          <div className="grid gap-12 pt-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <section className="border-b border-black/10 pb-10">
                <h3 className="text-[22px] font-medium text-black">
                  Chi tiết đơn hàng
                </h3>
                <div className="mt-6">
                  <DetailRow label="Người nhận" value={order.receiverName} />
                  <DetailRow label="Số điện thoại" value={order.receiverPhone} />
                  <DetailRow
                    label="Thanh toán"
                    value={
                      paymentMethodLabelMap[order.paymentMethod] ||
                      order.paymentMethod ||
                      "Đang cập nhật"
                    }
                  />
                  <DetailRow
                    label="Địa chỉ"
                    value={order.shippingAddress || "Đang cập nhật"}
                  />
                  {order.note ? <DetailRow label="Ghi chú" value={order.note} /> : null}
                </div>
              </section>

              <section className="pt-10">
                <h3 className="text-[22px] font-medium text-black">Mặt hàng</h3>
                <div className="mt-6 border-t border-black/10">
                  {(order.items || []).map((item, index) => (
                    <article
                      key={item.id || `${item.productName}-${index}`}
                      className="grid gap-5 border-b border-black/10 py-6 md:grid-cols-[140px_minmax(0,1fr)_180px] md:items-start"
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
                          <p>Số lượng {item.quantity || 0}</p>
                          <p>Đơn giá {formatCurrency(item.price || 0)}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Link
                            to={`/products/${item.productId}`}
                            className="rounded-full border border-black/12 px-4 py-2 text-sm font-medium text-black transition hover:border-black"
                          >
                            Xem sản phẩm
                          </Link>

                          {item.canReview ? (
                            <button
                              type="button"
                              onClick={() => setReviewingItem(item)}
                              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                              Đánh giá
                            </button>
                          ) : item.reviewed ? (
                            <span className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                              Đã đánh giá
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="md:text-right">
                        <p className="text-[14px] text-black/45">Giá</p>
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
              <div className="p-7 ring-1 ring-black/5 xl:sticky xl:top-28">
                <h3 className="text-[22px] font-medium text-black">Thông tin</h3>
                <div className="mt-6 space-y-5 border-t border-black/10 pt-5">
                  <SummaryRow label="Mã đơn hàng" value={`#${order.id}`} />
                  <SummaryRow label="Mặt hàng" value={order.items?.length || 0} />
                  <SummaryRow label="Tổng số lượng" value={totalQuantity} />
                  <SummaryRow
                    label="Thanh toán"
                    value={
                      paymentMethodLabelMap[order.paymentMethod] ||
                      order.paymentMethod ||
                      "Đang cập nhật"
                    }
                  />
                  <div className="border-t border-black/10 pt-5">
                    <SummaryRow
                      label="Tổng giá"
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

      <ReviewModal
        open={Boolean(reviewingItem)}
        item={reviewingItem}
        onClose={() => setReviewingItem(null)}
        onSuccess={fetchOrderDetail}
      />
    </div>
  );
};

export default OrderDetailPage;
