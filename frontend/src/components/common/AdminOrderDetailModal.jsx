import { formatCurrency } from "../../utils/formatCurrency";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import { AdminButton, statusPillClassName } from "../admin/AdminShell";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const toneByStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
      return "info";
    case "SHIPPING":
      return "violet";
    case "DELIVERED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
};

const getItemImage = (item) => {
  const rawImage =
    item?.productThumbnailUrl ||
    item?.thumbnailUrl ||
    item?.imageUrl ||
    item?.productImageUrl ||
    item?.variantImageUrl ||
    item?.product?.thumbnailUrl ||
    item?.product?.imageUrl ||
    (Array.isArray(item?.productImages) ? item.productImages[0]?.imageUrl || item.productImages[0]?.url : null) ||
    (Array.isArray(item?.images) ? item.images[0]?.imageUrl || item.images[0]?.url : null) ||
    null;

  return rawImage ? resolveImageUrl(rawImage) : null;
};

const AdminOrderDetailModal = ({ order, onClose, onUpdateStatus, updating }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200/70 bg-[#F5F7FB] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[32px] border-b border-slate-200/70 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Chi tiết đơn hàng #{order.id}</h2>
            <p className="mt-1 text-sm text-slate-500">{order.createdAt}</p>
          </div>
          <AdminButton type="button" variant="light" onClick={onClose}>Đóng</AdminButton>
        </div>

        <div className="space-y-6 p-6">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Thông tin giao hàng</h3>
                  <p className="mt-1 text-sm text-slate-500">Tóm tắt người nhận và địa chỉ giao hàng.</p>
                </div>
                <span className={statusPillClassName(toneByStatus(order.status))}>{order.status}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard label="Người nhận" value={order.receiverName} />
                <InfoCard label="Số điện thoại" value={order.receiverPhone} />
                <InfoCard label="Thanh toán" value={order.paymentMethod} />
                <InfoCard label="Tổng tiền" value={formatCurrency(order.totalAmount)} accent />
                <div className="md:col-span-2">
                  <InfoCard label="Địa chỉ giao hàng" value={order.shippingAddress} />
                </div>
              </div>

              {order.note ? (
                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Ghi chú đơn hàng</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{order.note}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Cập nhật trạng thái</h3>
                <p className="mt-1 text-sm text-slate-500">Chọn trạng thái mới cho đơn hàng này.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {STATUS_OPTIONS.map((status) => {
                  const isCurrent = order.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onUpdateStatus(status)}
                      disabled={updating || isCurrent}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isCurrent
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {updating && !isCurrent ? "Đang cập nhật..." : status}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Danh sách sản phẩm</h3>
                <p className="mt-1 text-sm text-slate-500">Chi tiết từng sản phẩm trong đơn, kèm ảnh để admin kiểm tra nhanh.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{order.items?.length || 0} sản phẩm</span>
            </div>

            <div className="space-y-4">
              {order.items?.map((item) => {
                const imageUrl = getItemImage(item);
                return (
                  <div key={item.id} className="grid gap-4 rounded-[24px] border border-slate-200 p-4 md:grid-cols-[112px_minmax(0,1fr)_180px] md:items-center">
                    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.productName} className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs font-medium text-slate-400">No image</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-slate-900">{item.productName}</h4>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Size: {item.size || "-"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Màu: {item.color || "-"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">SL: {item.quantity}</span>
                      </div>
                      {item.sku ? <p className="mt-2 text-sm text-slate-500">SKU: {item.sku}</p> : null}
                    </div>

                    <div className="rounded-[20px] bg-slate-50 p-4 text-left md:text-right">
                      <p className="text-sm text-slate-500">Đơn giá</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                      <p className="mt-3 text-sm text-slate-500">Thành tiền</p>
                      <p className="text-lg font-semibold text-indigo-600">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-lg font-semibold text-slate-900">
              <span>Tổng cộng</span>
              <span className="text-indigo-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, accent = false }) => {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm leading-6 ${accent ? "font-semibold text-indigo-600" : "text-slate-700"}`}>{value || "-"}</p>
    </div>
  );
};

export default AdminOrderDetailModal;
