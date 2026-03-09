import { formatCurrency } from "../../utils/formatCurrency";

const AdminOrderDetailModal = ({
  order,
  onClose,
  onUpdateStatus,
  updating,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Chi tiết đơn hàng #{order.id}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{order.createdAt}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
          <p><strong>Người nhận:</strong> {order.receiverName}</p>
          <p><strong>Số điện thoại:</strong> {order.receiverPhone}</p>
          <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
          <p><strong>Thanh toán:</strong> {order.paymentMethod}</p>
          <p><strong>Trạng thái:</strong> {order.status}</p>
        </div>

        {order.note && (
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <p className="font-medium text-slate-700">Ghi chú:</p>
            <p className="mt-1 text-slate-600">{order.note}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Danh sách sản phẩm
          </h3>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {item.productName}
                  </h4>
                  <p className="text-sm text-slate-500">
                    Size: {item.size} | Màu: {item.color}
                  </p>
                  <p className="text-sm text-slate-500">
                    Số lượng: {item.quantity}
                  </p>
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
            <span className="text-blue-600">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="mb-3 text-lg font-bold text-slate-800">
            Cập nhật trạng thái
          </h3>

          <div className="flex flex-wrap gap-3">
            {[
              "PENDING",
              "CONFIRMED",
              "SHIPPING",
              "DELIVERED",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(status)}
                disabled={updating || order.status === status}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  order.status === status
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {updating && order.status !== status ? "Đang cập nhật..." : status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;