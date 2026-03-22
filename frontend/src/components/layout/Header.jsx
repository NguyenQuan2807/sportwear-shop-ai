import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import SearchBar from "./SearchBar";
import { navigationItems } from "../../data/navigation";
import logo from "../../assets/logo.png";

const iconClass = "h-5 w-5";

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ open = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21.75 8.625c0-2.692-2.183-4.875-4.875-4.875A4.854 4.854 0 0 0 12 7.05a4.854 4.854 0 0 0-4.875-3.3c-2.692 0-4.875 2.183-4.875 4.875 0 7.212 9.75 11.625 9.75 11.625s9.75-4.413 9.75-11.625Z"
    />
  </svg>
);

const BagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6.75a3.75 3.75 0 1 0-7.5 0v3.75m-3 0h13.5l-.9 9a2.25 2.25 0 0 1-2.238 2.025H8.388A2.25 2.25 0 0 1 6.15 19.5l-.9-9Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a8.25 8.25 0 0 1 14.998 0"
    />
  </svg>
);

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [openMobileSection, setOpenMobileSection] = useState(null);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileSection(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white">
        Miễn phí vận chuyển cho đơn từ 699.000đ • Flash Sale mỗi ngày
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label="Mở menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center"
                >
                <img
                    src={logo}
                    alt="Sportwear Shop Logo"
                    className="h-14 w-auto object-contain sm:h-16 lg:h-20"
                />
            </Link>
          </div>

          <SearchBar className="hidden max-w-2xl flex-1 lg:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              title="Wishlist sẽ làm tiếp sau"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <HeartIcon />
            </button>

            <Link
              to="/cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              title="Giỏ hàng"
            >
              <BagIcon />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            {!user ? (
                <Link
                    to="/login"
                    className="hidden items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
                >
                    <UserIcon />
                    <span>Tài khoản</span>
                </Link>
                ) : (
                <div className="hidden items-center gap-3 sm:flex">
                    {user.roleName !== "ADMIN" && (
                    <Link
                        to="/orders"
                        className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Đơn hàng của tôi
                    </Link>
                    )}

                    {user.roleName === "ADMIN" && (
                    <Link
                        to="/admin"
                        className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Quản trị
                    </Link>
                    )}

                    <Link
                    to={user.roleName === "ADMIN" ? "/admin" : "/orders"}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    title={user.fullName}
                    >
                    <UserIcon />
                    </Link>

                    <button
                    onClick={logout}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                    Đăng xuất
                    </button>
                </div>
                )}
          </div>
        </div>

        <div className="pb-4 lg:hidden">
          <SearchBar />
        </div>

        <div
          className="relative hidden border-t border-slate-100 lg:block"
          onMouseLeave={() => setActiveMenu(null)}
        >
          <nav className="flex items-center justify-center gap-10 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              Trang chủ
            </NavLink>

            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setActiveMenu(item.label)}
                className={`flex items-center gap-1 text-sm font-semibold transition ${
                  activeMenu === item.label
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{item.label}</span>
                <ChevronDownIcon open={activeMenu === item.label} />
              </button>
            ))}

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              Tất cả sản phẩm
            </NavLink>

            {user && user.roleName !== "ADMIN" && (
                <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                    `text-sm font-semibold transition ${
                        isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                    }`
                    }
                >
                    Đơn hàng của tôi
                </NavLink>
                )}
          </nav>

          {activeMenu && (
            <div className="absolute left-1/2 top-full z-40 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              {navigationItems
                .filter((item) => item.label === activeMenu)
                .map((item) => (
                  <div key={item.label} className="grid grid-cols-12 gap-6">
                    <div className="col-span-8 grid grid-cols-3 gap-6">
                      {item.sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                            {section.title}
                          </h4>

                          <div className="space-y-3">
                            {section.links.map((link) => (
                              <Link
                                key={link.label}
                                to={link.href}
                                className="block text-sm font-medium text-slate-700 transition hover:text-slate-900"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={item.featured.link}
                      className="col-span-4 overflow-hidden rounded-[24px] bg-slate-100"
                    >
                      <div className="relative h-full min-h-[240px]">
                        <img
                          src={item.featured.image}
                          alt={item.featured.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                            Featured
                          </p>
                          <h3 className="mb-2 text-2xl font-bold">
                            {item.featured.title}
                          </h3>
                          <p className="mb-4 text-sm text-white/80">
                            {item.featured.description}
                          </p>
                          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                            Khám phá ngay
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="space-y-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block rounded-2xl px-4 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Trang chủ
              </Link>

              {navigationItems.map((item) => {
                const open = openMobileSection === item.label;

                return (
                  <div
                    key={item.label}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileSection((prev) =>
                          prev === item.label ? null : item.label
                        )
                      }
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-slate-900"
                    >
                      <span>{item.label}</span>
                      <ChevronDownIcon open={open} />
                    </button>

                    {open && (
                      <div className="space-y-4 border-t border-slate-200 bg-slate-50 px-4 py-4">
                        {item.sections.map((section) => (
                          <div key={section.title}>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                              {section.title}
                            </p>
                            <div className="space-y-2">
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  to={link.href}
                                  onClick={closeMobileMenu}
                                  className="block text-sm text-slate-700"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                to="/products"
                onClick={closeMobileMenu}
                className="block rounded-2xl px-4 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Tất cả sản phẩm
              </Link>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={user.roleName === "ADMIN" ? "/admin" : "/orders"}
                      onClick={closeMobileMenu}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      {user.roleName === "ADMIN" ? "Quản trị" : "Đơn hàng của tôi"}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;