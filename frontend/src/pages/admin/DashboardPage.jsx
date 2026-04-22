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
import {
  AdminCard,
  AdminMetricCard,
  AdminPageHeader,
  AdminTableShell,
} from "../../components/admin/AdminShell";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPING: "bg-violet-50 text-violet-700 border-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const CHART_COLORS = ["#465FFF", "#12B76A", "#F79009", "#F04438", "#7A5AF8", "#0BA5EC"];

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
      const backendMessage = error?.response?.data?.message || "Không thể tải dữ liệu dashboard";
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
    return STATUS_STYLES[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Dashboard"
          description="Đang tải dữ liệu tổng quan hệ thống quản trị."
          breadcrumbs={["Admin", "Dashboard"]}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[28px] border border-slate-200/70 bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[420px] animate-pulse rounded-[28px] border border-slate-200/70 bg-white shadow-sm" />
          <div className="h-[420px] animate-pulse rounded-[28px] border border-slate-200/70 bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <AdminCard title="Không thể tải dashboard" className="border-red-200 bg-red-50">
        <div className="text-sm font-medium text-red-600">{errorMessage}</div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Giao diện admin đã được đồng bộ lại theo cấu trúc layout, card, chart và bảng dữ liệu từ template dashboard hiện đại, nhưng vẫn giữ nguyên API và logic hiện tại của bạn."
        breadcrumbs={["Admin", "Dashboard"]}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Tổng sản phẩm"
          value={dashboardData.totalProducts}
          helper="Danh mục sản phẩm đang quản lý"
          tone="brand"
          icon={<PackageIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Tổng đơn hàng"
          value={dashboardData.totalOrders}
          helper="Đơn hàng phát sinh trên hệ thống"
          tone="emerald"
          icon={<OrdersIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Tổng người dùng"
          value={dashboardData.totalUsers}
          helper="Tài khoản đang hoạt động"
          tone="violet"
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Tổng doanh thu"
          value={formatCurrency(dashboardData.totalRevenue || 0)}
          helper="Doanh thu cộng dồn từ đơn hàng"
          tone="amber"
          icon={<RevenueIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminCard
          title="Doanh thu theo tháng"
          description="Biểu đồ cột doanh thu đang bám theo dữ liệu admin hiện có của hệ thống."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.revenueByMonths || []}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#465FFF" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Đơn hàng theo trạng thái"
          description="Tỷ trọng đơn hàng hiện tại để bạn nhìn nhanh sức khỏe vận hành."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.orderStatusStats || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={58}
                  paddingAngle={3}
                  label
                >
                  {(dashboardData.orderStatusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Đơn hàng mới nhất" description="Danh sách đơn gần đây để bạn theo dõi nhanh quá trình vận hành.">
        {dashboardData.recentOrders?.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có đơn hàng nào.</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mã đơn</th>
                    <th className="px-5 py-4 font-semibold">Người nhận</th>
                    <th className="px-5 py-4 font-semibold">SĐT</th>
                    <th className="px-5 py-4 font-semibold">Tổng tiền</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Thanh toán</th>
                    <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-semibold text-slate-800">#{order.id}</td>
                      <td className="px-5 py-4 text-slate-700">{order.receiverName}</td>
                      <td className="px-5 py-4 text-slate-500">{order.receiverPhone}</td>
                      <td className="px-5 py-4 text-slate-700">{formatCurrency(order.totalAmount || 0)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{order.paymentMethod}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableShell>
        )}
      </AdminCard>
    </div>
  );
};

function iconProps(className) {
  return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", className };
}
function PackageIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 8 4.5-8 4.5L4 7.5 12 3Z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 17.5 12 22l8-4.5" />
    </svg>
  );
}
function OrdersIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 7h12M6 12h12M6 17h8" strokeLinecap="round" />
      <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
function UsersIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M20 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M16.5 4.13a3.5 3.5 0 0 1 0 7.74" />
    </svg>
  );
}
function RevenueIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12h18" strokeLinecap="round" />
      <path d="M7 16c0 1.657 2.239 3 5 3s5-1.343 5-3-2.239-3-5-3-5-1.343-5-3 2.239-3 5-3 5 1.343 5 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default DashboardPage;
