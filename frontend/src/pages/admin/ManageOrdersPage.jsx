import { useEffect, useMemo, useState } from "react";
import {
  getAdminOrderDetailApi,
  getAdminOrdersApi,
  updateAdminOrderStatusApi,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../utils/formatCurrency";
import AdminOrderDetailModal from "../../components/common/AdminOrderDetailModal";
import AdminTableToolbar from "../../components/common/AdminTableToolbar";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

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

  const filteredOrders = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return orders;

    return orders.filter((order) =>
      [
        order.id,
        order.receiverName,
        order.receiverPhone,
        order.paymentMethod,
        order.status,
        order.createdAt,
        order.totalAmount,
      ].some((value) => normalizeText(value).includes(keyword))
    );
  }, [orders, searchTerm]);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setErrorMessage("");
      const response = await getAdminOrderDetailApi(id);
      setSelectedOrder(response.data);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết đơn hàng";
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
      const backendMessage =
        error?.response?.data?.message || "Không thể cập nhật trạng thái";
      setErrorMessage(backendMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminTableToolbar
        title="Quản lý đơn hàng"
        description="Theo dõi và cập nhật trạng thái đơn hàng của khách hàng"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm theo mã đơn, tên người nhận, SĐT, trạng thái..."
        resultCount={filteredOrders.length}
      />

      {successMessage && (
        <div className="rounded-xl bg-green-100 p-4 text-green-700 shadow">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6 text-slate-500">Đang tải danh sách đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-slate-500">
            {searchTerm ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có đơn hàng nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người nhận</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">#{order.id}</td>
                    <td className="px-4 py-3">{order.receiverName}</td>
                    <td className="px-4 py-3">{order.receiverPhone}</td>
                    <td className="px-4 py-3">{order.paymentMethod}</td>
                    <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.createdAt}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(order.id)}
                        className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        {detailLoading && selectedOrder?.id === order.id
                          ? "Đang tải..."
                          : "Xem chi tiết"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updating={updatingStatus}
      />
    </div>
  );
};

export default ManageOrdersPage;