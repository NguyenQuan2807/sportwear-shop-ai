import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminDashboardStatsApi } from "../../services/adminDashboardService";
import { getAdminOrdersApi } from "../../services/adminOrderService";
import { getAdminDashboardInsightApi } from "../../services/adminAiService";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminFilterLabel,
  AdminMetricCard,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
} from "../../components/admin/AdminShell";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPING: "bg-violet-50 text-violet-700 border-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const CHART_COLORS = ["#465FFF", "#12B76A", "#F79009", "#F04438", "#7A5AF8", "#0BA5EC", "#EE46BC"];

const FILTER_TYPES = [
  { value: "all", label: "Tất cả" },
  { value: "day", label: "Theo ngày" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
];

const toDateInputValue = (date = new Date()) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
};

const toMonthInputValue = (date = new Date()) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 7);
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, index) => currentYear - index);
};

const parseOrderDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOrderAmount = (order) => Number(order?.totalAmount || order?.total || 0);

const getFilterRange = ({ filterType, selectedDate, selectedMonth, selectedYear }) => {
  if (filterType === "day") {
    const start = new Date(`${selectedDate}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (filterType === "month") {
    const [year, month] = String(selectedMonth).split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
  }

  if (filterType === "year") {
    const year = Number(selectedYear);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return { start, end };
  }

  return { start: null, end: null };
};

const isOrderInRange = (order, range) => {
  if (!range.start || !range.end) return true;
  const date = parseOrderDate(order.createdAt);
  if (!date) return false;
  return date >= range.start && date < range.end;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("vi-VN");
};

const shortCurrency = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return String(amount);
};

const buildRevenueTrend = (orders, filterType, dashboardMonths = []) => {
  if (filterType === "all" && dashboardMonths?.length > 0) {
    return dashboardMonths.map((item) => ({
      label: item.month,
      revenue: Number(item.revenue || 0),
      orders: Number(item.orders || item.count || 0),
    }));
  }

  const map = new Map();

  if (filterType === "day") {
    for (let hour = 0; hour < 24; hour += 1) {
      const label = `${String(hour).padStart(2, "0")}h`;
      map.set(label, { label, revenue: 0, orders: 0 });
    }
  } else if (filterType === "month") {
    const firstOrderDate = orders.map((order) => parseOrderDate(order.createdAt)).find(Boolean) || new Date();
    const year = firstOrderDate.getFullYear();
    const month = firstOrderDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= lastDay; day += 1) {
      map.set(String(day), { label: String(day), revenue: 0, orders: 0 });
    }
  } else {
    for (let month = 0; month < 12; month += 1) {
      const label = `T${month + 1}`;
      map.set(label, { label, revenue: 0, orders: 0 });
    }
  }

  orders.forEach((order) => {
    const date = parseOrderDate(order.createdAt);
    if (!date) return;

    let key = "";
    if (filterType === "day") key = `${String(date.getHours()).padStart(2, "0")}h`;
    else if (filterType === "month") key = String(date.getDate());
    else key = `T${date.getMonth() + 1}`;

    if (!map.has(key)) map.set(key, { label: key, revenue: 0, orders: 0 });

    const item = map.get(key);
    item.revenue += getOrderAmount(order);
    item.orders += 1;
  });

  return Array.from(map.values());
};

const buildStatusStats = (orders, fallbackStats = []) => {
  if (!orders.length) {
    return (fallbackStats || []).map((item) => ({
      status: STATUS_LABELS[item.status] || item.status,
      count: Number(item.count || 0),
    }));
  }

  const map = new Map();
  orders.forEach((order) => {
    const key = order.status || "UNKNOWN";
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries()).map(([status, count]) => ({
    status: STATUS_LABELS[status] || status,
    count,
  }));
};

const buildPaymentStats = (orders) => {
  const map = new Map();

  orders.forEach((order) => {
    const key = order.paymentMethod || "Không rõ";
    const current = map.get(key) || { paymentMethod: key, orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += getOrderAmount(order);
    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => b.orders - a.orders);
};

const getAiInsightParams = ({ filterType, selectedDate, selectedMonth, selectedYear }) => {
  if (filterType === "day") return { period: "day", date: selectedDate };
  if (filterType === "month") return { period: "month", month: selectedMonth };
  if (filterType === "year") return { period: "year", year: Number(selectedYear) };
  return { period: "all" };
};

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

  const [allOrders, setAllOrders] = useState([]);
  const [filterType, setFilterType] = useState("month");
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());
  const [selectedMonth, setSelectedMonth] = useState(toMonthInputValue());
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [dashboardResponse, ordersResponse] = await Promise.all([
        getAdminDashboardStatsApi(),
        getAdminOrdersApi(),
      ]);

      setDashboardData(dashboardResponse.data || {});
      setAllOrders(ordersResponse.data || []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsight = async () => {
    try {
      setAiLoading(true);
      setAiError("");

      const params = getAiInsightParams({
        filterType,
        selectedDate,
        selectedMonth,
        selectedYear,
      });

      const response = await getAdminDashboardInsightApi(params);
      setAiInsight(response.data);
    } catch (error) {
      setAiError(error?.response?.data?.message || "Không thể tải AI phân tích dashboard");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const openAiDashboardModal = () => {
    setAiModalOpen(true);
    fetchAiInsight();
  };

  const filterRange = useMemo(
    () =>
      getFilterRange({
        filterType,
        selectedDate,
        selectedMonth,
        selectedYear,
      }),
    [filterType, selectedDate, selectedMonth, selectedYear],
  );

  const filteredOrders = useMemo(() => {
    const sourceOrders = allOrders.length > 0 ? allOrders : dashboardData.recentOrders || [];
    return sourceOrders.filter((order) => isOrderInRange(order, filterRange));
  }, [allOrders, dashboardData.recentOrders, filterRange]);

  const filteredRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    [filteredOrders],
  );

  const pendingOrderCount = useMemo(
    () => filteredOrders.filter((order) => order.status === "PENDING").length,
    [filteredOrders],
  );

  const displayTotalOrders = filteredOrders.length;
  const displayTotalRevenue = filteredRevenue;

  const revenueTrendData = useMemo(
    () =>
      buildRevenueTrend(
        filteredOrders,
        filterType,
        filterType === "all" ? dashboardData.revenueByMonths : [],
      ),
    [filteredOrders, filterType, dashboardData.revenueByMonths],
  );

  const statusStatsData = useMemo(
    () => buildStatusStats(filteredOrders, dashboardData.orderStatusStats),
    [filteredOrders, dashboardData.orderStatusStats],
  );

  const paymentStatsData = useMemo(
    () => buildPaymentStats(filteredOrders),
    [filteredOrders],
  );

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => {
        const dateA = parseOrderDate(a.createdAt)?.getTime() || 0;
        const dateB = parseOrderDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 8);
  }, [filteredOrders]);

  const resetFilter = () => {
    setFilterType("month");
    setSelectedDate(toDateInputValue());
    setSelectedMonth(toMonthInputValue());
    setSelectedYear(String(new Date().getFullYear()));
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
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] border border-slate-200/70 bg-white shadow-sm"
            />
          ))}
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
        description="Theo dõi doanh thu, đơn hàng và trạng thái vận hành."
        breadcrumbs={["Admin", "Dashboard"]}
        action={
          <AdminButton type="button" variant="brand" onClick={openAiDashboardModal}>
            Phân tích bằng AI
          </AdminButton>
        }
      />

      <AiDashboardInsightModal
        open={aiModalOpen}
        insight={aiInsight}
        loading={aiLoading}
        errorMessage={aiError}
        onRefresh={fetchAiInsight}
        onClose={() => setAiModalOpen(false)}
      />

      <AdminCard
        title="Bộ lọc thời gian"
        description="Lọc dashboard theo ngày, tháng hoặc năm. AI cũng phân tích theo đúng khoảng lọc này."
        action={
          <AdminButton type="button" variant="light" onClick={resetFilter}>
            Đặt lại
          </AdminButton>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <AdminFilterLabel>Kiểu lọc</AdminFilterLabel>
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className={adminInputClassName}
            >
              {FILTER_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className={filterType === "day" ? "" : "opacity-45"}>
              <AdminFilterLabel>Ngày</AdminFilterLabel>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                disabled={filterType !== "day"}
                className={adminInputClassName}
              />
            </div>

            <div className={filterType === "month" ? "" : "opacity-45"}>
              <AdminFilterLabel>Tháng</AdminFilterLabel>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                disabled={filterType !== "month"}
                className={adminInputClassName}
              />
            </div>

            <div className={filterType === "year" ? "" : "opacity-45"}>
              <AdminFilterLabel>Năm</AdminFilterLabel>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                disabled={filterType !== "year"}
                className={adminInputClassName}
              >
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Tổng sản phẩm"
          value={dashboardData.totalProducts}
          helper="Danh mục sản phẩm đang quản lý"
          tone="brand"
          icon={<PackageIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Đơn hàng trong kỳ"
          value={displayTotalOrders}
          helper="Theo bộ lọc thời gian hiện tại"
          tone="emerald"
          icon={<OrdersIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Đơn chờ xác nhận"
          value={pendingOrderCount}
          helper="Đơn hàng PENDING trong kỳ"
          tone="violet"
          icon={<BellIcon className="h-5 w-5" />}
        />
        <AdminMetricCard
          label="Doanh thu trong kỳ"
          value={formatCurrency(displayTotalRevenue || 0)}
          helper="Tổng tiền đơn hàng theo bộ lọc"
          tone="amber"
          icon={<RevenueIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminCard
          title="Doanh thu theo thời gian"
          description="Biểu đồ doanh thu thay đổi theo bộ lọc ngày, tháng hoặc năm."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#465FFF" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#465FFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={shortCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ stroke: "#CBD5E1" }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#465FFF"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Đơn hàng theo trạng thái"
          description="Tỷ trọng đơn hàng theo từng trạng thái trong kỳ."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStatsData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={58}
                  paddingAngle={3}
                  label
                >
                  {statusStatsData.map((entry, index) => (
                    <Cell key={`status-cell-${entry.status}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Số đơn theo thời gian"
          description="Biểu đồ mới: theo dõi số lượng đơn hàng phát sinh trong khoảng lọc."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Số đơn"
                  stroke="#12B76A"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Đơn hàng theo phương thức thanh toán"
          description="Biểu đồ mới: so sánh số đơn và doanh thu theo từng phương thức thanh toán."
        >
          <div className="h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentStatsData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="paymentMethod" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={shortCurrency} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Doanh thu" ? formatCurrency(value) : value
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Số đơn" fill="#F79009" radius={[10, 10, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" fill="#7A5AF8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <AdminCard
        title="Đơn hàng mới nhất trong kỳ"
        description="Danh sách đơn gần đây sau khi áp dụng bộ lọc thời gian."
      >
        {recentOrders.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có đơn hàng nào trong khoảng thời gian này.</div>
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
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-semibold text-slate-800">#{order.id}</td>
                      <td className="px-5 py-4 text-slate-700">{order.receiverName}</td>
                      <td className="px-5 py-4 text-slate-500">{order.receiverPhone}</td>
                      <td className="px-5 py-4 text-slate-700">{formatCurrency(getOrderAmount(order))}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                          {STATUS_LABELS[order.status] || order.status}
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

function AiDashboardInsightModal({ open, insight, loading, errorMessage, onRefresh, onClose }) {
  const sourceText = insight?.source === "GEMINI_GROUNDED" ? "Gemini + dữ liệu thật" : "Rule-based scoring";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Đóng AI phân tích dashboard"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">AI Dashboard Insight</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Phân tích dashboard bằng AI
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              AI đọc dữ liệu đơn hàng, doanh thu, trạng thái đơn, tồn kho và đưa ra cảnh báo quản trị.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AdminButton type="button" variant="brand" onClick={onRefresh} disabled={loading}>
              {loading ? "AI đang phân tích..." : "Phân tích lại"}
            </AdminButton>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Đóng modal"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

          {loading && !insight ? (
            <div className="space-y-4">
              <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
                <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
              </div>
            </div>
          ) : insight ? (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Tổng quan</p>
                    <p className="mt-2 text-base font-semibold leading-7 text-slate-900">
                      {insight.overview}
                    </p>
                  </div>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {sourceText}
                  </span>
                </div>

                <InsightList title="Điểm nổi bật" items={insight.highlights} tone="emerald" />
                <InsightList title="Cảnh báo" items={insight.warnings} tone="rose" />
                <InsightList title="Gợi ý cải thiện" items={insight.recommendations} tone="blue" />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Việc nên làm ngay
                </p>

                {(insight.priorityActions || []).length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Chưa có hành động ưu tiên. Hệ thống sẽ tự cảnh báo khi có đơn chờ xác nhận,
                    tồn kho thấp hoặc doanh thu giảm.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {insight.priorityActions.map((action, index) => (
                      <div key={`${action.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-slate-900">{action.title}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            action.priority === "HIGH"
                              ? "bg-rose-100 text-rose-700"
                              : action.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-700"
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {action.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Chưa có dữ liệu AI. Bấm “Phân tích lại” để tạo insight.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightList({ title, items = [], tone }) {
  if (!items || items.length === 0) return null;

  const dotClass =
    tone === "rose"
      ? "bg-rose-500"
      : tone === "emerald"
        ? "bg-emerald-500"
        : "bg-blue-500";

  return (
    <div className="mt-5">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-600">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function iconProps(className) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    className,
  };
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
function RevenueIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12h18" strokeLinecap="round" />
      <path d="M7 16c0 1.657 2.239 3 5 3s5-1.343 5-3-2.239-3-5-3-5-1.343-5-3 2.239-3 5-3 5 1.343 5 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21h4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export default DashboardPage;
