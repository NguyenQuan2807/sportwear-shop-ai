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
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

const PAGE_SIZE = 10;
const statusToneMap = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPING: "violet",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
};
const actionBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition hover:-translate-y-0.5 hover:bg-sky-100";
const normalizeText = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminOrdersApi();
      setOrders(response.data || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tải danh sách đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const keyword = normalizeText(searchTerm);
        const matchKeyword =
          !keyword ||
          [
            order.id,
            order.receiverName,
            order.receiverPhone,
            order.paymentMethod,
            order.status,
            order.createdAt,
            order.totalAmount,
          ].some((v) => normalizeText(v).includes(keyword));
        const matchStatus = !statusFilter || order.status === statusFilter;
        return matchKeyword && matchStatus;
      }),
    [orders, searchTerm, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredOrders, currentPage],
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setErrorMessage("");
      const response = await getAdminOrderDetailApi(id);
      setSelectedOrder(response.data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tải chi tiết đơn hàng",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedOrder || selectedOrder.status === status) return;
    try {
      setUpdatingStatus(true);
      await updateAdminOrderStatusApi(selectedOrder.id, status);
      setSuccessMessage("Cập nhật trạng thái đơn hàng thành công");
      const response = await getAdminOrderDetailApi(selectedOrder.id);
      setSelectedOrder(response.data);
      fetchOrders();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Không thể cập nhật trạng thái đơn hàng",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const start =
    filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, filteredOrders.length);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý đơn hàng"
        breadcrumbs={["Admin", "Đơn hàng"]}
      />
      {successMessage ? (
        <AdminAlert type="success">{successMessage}</AdminAlert>
      ) : null}
      {errorMessage ? (
        <AdminAlert type="error">{errorMessage}</AdminAlert>
      ) : null}
      <AdminCard>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon className="h-5 w-5" />
              </span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã đơn, người nhận, SĐT, trạng thái..."
                className={`${adminInputClassName} pl-12`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={adminInputClassName}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">
              Đang tải danh sách đơn hàng...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-sm text-slate-500">
              Không có đơn hàng phù hợp.
            </div>
          ) : (
            <>
              <AdminTableShell>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <thead className="border-b border-slate-200 bg-white text-left text-slate-500">
                      <tr>
                        <th className="w-[10%] px-4 py-3 font-semibold">
                          Mã đơn
                        </th>
                        <th className="w-[20%] px-4 py-3 font-semibold">
                          Người nhận
                        </th>
                        <th className="w-[14%] px-4 py-3 font-semibold">
                          Thanh toán
                        </th>
                        <th className="w-[14%] px-4 py-3 font-semibold">
                          Tổng tiền
                        </th>
                        <th className="w-[14%] px-4 py-3 font-semibold">
                          Trạng thái
                        </th>
                        <th className="w-[16%] px-4 py-3 font-semibold">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">
                              {order.receiverName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.receiverPhone}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {order.paymentMethod || "-"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={statusPillClassName(
                                statusToneMap[order.status] || "neutral",
                              )}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {order.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <button
                                title="Xem chi tiết đơn hàng"
                                className={actionBtn}
                                onClick={() => handleViewDetail(order.id)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminTableShell>
              <PaginationBar
                start={start}
                end={end}
                total={filteredOrders.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </AdminCard>
      {detailLoading ? (
        <div className="text-sm text-slate-500">
          Đang tải chi tiết đơn hàng...
        </div>
      ) : null}
      <AdminOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updatingStatus}
      />
    </div>
  );
}

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ChevronLeftIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PaginationBar({
  start,
  end,
  total,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <span>
        Hiển thị {start}-{end} trên {total} dữ liệu
      </span>
      <div className="flex items-center gap-2 self-end md:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${currentPage === page ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
