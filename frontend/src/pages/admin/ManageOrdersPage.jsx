import { useEffect, useMemo, useState } from "react";
import {
  getAdminOrderDetailApi,
  getAdminOrdersApi,
  updateAdminOrderStatusApi,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../utils/formatCurrency";
import AdminOrderDetailModal from "../../components/common/AdminOrderDetailModal";
import {
  AdminAlert,
  AdminCard,
  AdminFilterLabel,
  AdminMetricCard,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const statusToneMap = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPING: "violet",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminOrdersApi();
      setOrders(response.data || []);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải danh sách đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return orders;

    return orders.filter((order) =>
      [order.id, order.receiverName, order.receiverPhone, order.paymentMethod, order.status, order.createdAt, order.totalAmount].some((value) =>
        normalizeText(value).includes(keyword)
      )
    );
  }, [orders, searchTerm]);

  const deliveredCount = useMemo(() => orders.filter((order) => order.status === "DELIVERED").length, [orders]);
  const pendingCount = useMemo(() => orders.filter((order) => order.status === "PENDING").length, [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), [orders]);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setErrorMessage("");
      const response = await getAdminOrderDetailApi(id);
      setSelectedOrder(response.data);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải chi tiết đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateAdminOrderStatusApi(selectedOrder.id, { status });
      setSelectedOrder(response.data);
      setSuccessMessage("Cập nhật trạng thái đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể cập nhật trạng thái";
      setErrorMessage(backendMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description="Trang đơn hàng đã được đưa về cùng phong cách dashboard mới để bạn theo dõi, tìm kiếm và kiểm tra chi tiết đơn hàng dễ hơn."
        breadcrumbs={["Admin", "Sales", "Đơn hàng"]}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Tổng đơn hàng" value={orders.length} helper="Toàn bộ đơn hàng trên hệ thống" tone="brand" icon={<OrdersIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đã giao" value={deliveredCount} helper="Đơn hàng hoàn tất giao" tone="emerald" icon={<CheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang chờ xử lý" value={pendingCount} helper="Cần ưu tiên xử lý sớm" tone="amber" icon={<ClockIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Doanh thu đơn hàng" value={formatCurrency(totalRevenue)} helper="Tổng cộng từ danh sách hiện tại" tone="violet" icon={<RevenueIcon className="h-5 w-5" />} />
      </div>

      <AdminCard title="Tìm kiếm đơn hàng" description="Lọc nhanh theo mã đơn, người nhận, số điện thoại, trạng thái hoặc phương thức thanh toán.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_200px] xl:items-end">
          <div>
            <AdminFilterLabel>Từ khóa</AdminFilterLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, tên người nhận, SĐT, trạng thái..."
              className={adminInputClassName}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Kết quả tìm thấy: <span className="font-semibold text-slate-900">{filteredOrders.length}</span>
          </div>
        </div>
      </AdminCard>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      <AdminCard title="Danh sách đơn hàng" description="Xem nhanh đơn hàng mới nhất, trạng thái xử lý và mở modal chi tiết để thao tác.">
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-sm text-slate-500">{searchTerm ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có đơn hàng nào."}</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mã đơn</th>
                    <th className="px-5 py-4 font-semibold">Người nhận</th>
                    <th className="px-5 py-4 font-semibold">SĐT</th>
                    <th className="px-5 py-4 font-semibold">Thanh toán</th>
                    <th className="px-5 py-4 font-semibold">Tổng tiền</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800">#{order.id}</td>
                      <td className="px-5 py-4 text-slate-700">{order.receiverName}</td>
                      <td className="px-5 py-4 text-slate-500">{order.receiverPhone}</td>
                      <td className="px-5 py-4 text-slate-500">{order.paymentMethod}</td>
                      <td className="px-5 py-4 text-slate-700">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(statusToneMap[order.status] || "neutral")}>{order.status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{order.createdAt}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          {detailLoading && selectedOrder?.id === order.id ? "Đang tải..." : "Xem chi tiết"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableShell>
        )}
      </AdminCard>

      <AdminOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} updating={updatingStatus} />
    </div>
  );
};

function iconProps(className) { return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", className }; }
function OrdersIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="M6 7h12M6 12h12M6 17h8" strokeLinecap="round" /><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /></svg>; }
function CheckIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function RevenueIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="M3 12h18" strokeLinecap="round" /><path d="M7 16c0 1.657 2.239 3 5 3s5-1.343 5-3-2.239-3-5-3-5-1.343-5-3 2.239-3 5-3 5 1.343 5 3" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default ManageOrdersPage;
