import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminDashboardStatsApi } from "../../services/adminDashboardService";
import { formatCurrency } from "../../utils/formatCurrency";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    revenueByMonths: [],
    orderStatusStats: [],
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminDashboardStatsApi();
      setDashboardData(response.data || {});
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải dữ liệu dashboard";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleString("vi-VN");
  };

  const getStatusBadgeClass = (status) => {
    return STATUS_COLORS[status] || "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        Đang tải dashboard...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl bg-red-100 p-6 text-red-600 shadow">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Tổng quan hệ thống quản trị cửa hàng
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-blue-100">Tổng sản phẩm</p>
          <h2 className="mt-3 text-3xl font-bold">{dashboardData.totalProducts}</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-emerald-100">Tổng đơn hàng</p>
          <h2 className="mt-3 text-3xl font-bold">{dashboardData.totalOrders}</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-violet-100">Tổng người dùng</p>
          <h2 className="mt-3 text-3xl font-bold">{dashboardData.totalUsers}</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-orange-100">Tổng doanh thu</p>
          <h2 className="mt-3 text-3xl font-bold">
            {formatCurrency(dashboardData.totalRevenue || 0)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">Doanh thu theo tháng</h2>
            <p className="text-sm text-slate-500">Theo dữ liệu đơn hàng hiện có</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.revenueByMonths || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800">Đơn hàng theo trạng thái</h2>
            <p className="text-sm text-slate-500">Tỷ lệ đơn hàng hiện tại</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.orderStatusStats || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(dashboardData.orderStatusStats || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Đơn hàng mới nhất</h2>
        </div>

        {dashboardData.recentOrders?.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Người nhận</th>
                  <th className="px-4 py-3 text-left">SĐT</th>
                  <th className="px-4 py-3 text-left">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thanh toán</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">#{order.id}</td>
                    <td className="px-4 py-3">{order.receiverName}</td>
                    <td className="px-4 py-3">{order.receiverPhone}</td>
                    <td className="px-4 py-3">{formatCurrency(order.totalAmount || 0)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.paymentMethod}</td>
                    <td className="px-4 py-3">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;