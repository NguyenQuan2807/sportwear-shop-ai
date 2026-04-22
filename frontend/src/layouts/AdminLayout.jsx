import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SIDEBAR_KEY = "admin_sidebar_expanded";

const menuGroups = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/admin", icon: DashboardIcon },
      { label: "Đơn hàng", to: "/admin/orders", icon: OrdersIcon },
      { label: "Người dùng", to: "/admin/users", icon: UsersIcon },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Sản phẩm", to: "/admin/products", icon: ProductsIcon },
      { label: "Danh mục", to: "/admin/categories", icon: LayersIcon },
      { label: "Thương hiệu", to: "/admin/brands", icon: TagIcon },
      { label: "Môn thể thao", to: "/admin/sports", icon: ActivityIcon },
      { label: "Khuyến mãi", to: "/admin/promotions", icon: SparklesIcon },
    ],
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const storedValue = localStorage.getItem(SIDEBAR_KEY);
    return storedValue == null ? true : storedValue === "true";
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarExpanded));
  }, [sidebarExpanded]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    for (const group of menuGroups) {
      const matched = group.items.find((item) => item.to === location.pathname);
      if (matched) return matched.label;
    }
    return "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900">
      {mobileSidebarOpen ? (
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng sidebar"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200/70 bg-white transition-all duration-300 ${
          sidebarExpanded ? "w-[280px]" : "w-[92px]"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`flex items-center border-b border-slate-200/70 px-5 py-6 ${sidebarExpanded ? "justify-between" : "justify-center"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <LogoIcon className="h-5 w-5" />
            </div>
            {sidebarExpanded ? (
              <div>
                <div className="text-sm font-medium text-slate-400">Sportwear Shop</div>
                <div className="text-lg font-semibold tracking-tight text-slate-900">Admin Panel</div>
              </div>
            ) : null}
          </div>

          {sidebarExpanded ? (
            <button
              type="button"
              onClick={() => setSidebarExpanded(false)}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:inline-flex"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-7">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 ${sidebarExpanded ? "px-3" : "text-center"}`}>
                  {sidebarExpanded ? group.title : "• • •"}
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/admin"}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                            isActive
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          } ${sidebarExpanded ? "justify-start" : "justify-center"}`
                        }
                        title={item.label}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-current group-[.active]:bg-indigo-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        {sidebarExpanded ? <span className="truncate">{item.label}</span> : null}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200/70 p-4">
          <div className={`rounded-[24px] bg-slate-900 px-4 py-4 text-white ${sidebarExpanded ? "block" : "hidden lg:block"}`}>
            <div className={`flex items-center gap-3 ${sidebarExpanded ? "" : "justify-center"}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <UserCircleIcon className="h-5 w-5" />
              </div>
              {sidebarExpanded ? (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{user?.fullName || user?.name || user?.email || "Admin"}</div>
                  <div className="truncate text-xs text-white/60">{user?.role || "Quản trị viên"}</div>
                </div>
              ) : null}
            </div>

            <div className={`mt-4 grid gap-2 ${sidebarExpanded ? "grid-cols-2" : "grid-cols-1"}`}>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                {sidebarExpanded ? "Xem shop" : <HomeIcon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {sidebarExpanded ? "Đăng xuất" : <LogoutIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!sidebarExpanded ? (
            <button
              type="button"
              onClick={() => setSidebarExpanded(true)}
              className="mt-3 hidden w-full items-center justify-center rounded-2xl border border-slate-200 px-3 py-3 text-slate-600 transition hover:bg-slate-50 lg:inline-flex"
              aria-label="Mở rộng sidebar"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </aside>

      <div className={`min-h-screen transition-all duration-300 ${sidebarExpanded ? "lg:pl-[280px]" : "lg:pl-[92px]"}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label="Mở menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <div> 
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden min-w-[260px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 lg:flex">
                <SearchIcon className="h-4 w-4" />
                <span>Tìm kiếm nhanh trong admin...</span>
              </div>

              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 md:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <UserCircleIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user?.fullName || user?.name || "Admin"}</div>
                  <div className="text-xs text-slate-400">{user?.email || "Quản trị viên hệ thống"}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 xl:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function iconProps(className) {
  return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", className };
}

function MenuIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
function DashboardIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" strokeLinejoin="round" />
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
function ProductsIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 8 4.5-8 4.5L4 7.5 12 3Z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 17.5 12 22l8-4.5" />
    </svg>
  );
}
function LayersIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" strokeLinejoin="round" />
    </svg>
  );
}
function TagIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M20 10.59V5a1 1 0 0 0-1-1h-5.59a1 1 0 0 0-.7.29l-8.42 8.42a1 1 0 0 0 0 1.41l5.59 5.59a1 1 0 0 0 1.41 0l8.42-8.42a1 1 0 0 0 .29-.7Z" />
      <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ActivityIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M22 12h-4l-3 7-6-14-3 7H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SparklesIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Zm7 11 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1 1-2.6ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronLeftIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LogoIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3c4.97 0 9 3.806 9 8.5 0 3.458-2.193 6.428-5.343 7.755L12 21l-3.657-1.245C5.193 17.428 3 14.458 3 11.5 3 6.806 7.03 3 12 3Zm0 3.2c-3.21 0-5.8 2.397-5.8 5.3 0 1.997 1.213 3.79 3.107 4.704L12 17.2l2.693-.996C16.587 15.29 17.8 13.497 17.8 11.5c0-2.903-2.59-5.3-5.8-5.3Z" />
    </svg>
  );
}
function HomeIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LogoutIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserCircleIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </svg>
  );
}

export default AdminLayout;
