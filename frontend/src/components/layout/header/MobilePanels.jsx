import { Link } from "react-router-dom";

const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MobilePanels = ({
  mobileOpen,
  query,
  setQuery,
  handleSearchSubmit,
  quickSearches,
  handleQuickSearch,
  visibleNavItems,
  mobileExpanded,
  setMobileExpanded,
  setMobileOpen,
  user,
  logout,
  adminPath,
}) => {
  if (!mobileOpen) return null;

  return (
    <div className="border-t border-black/5 bg-white lg:hidden">
      <div className="px-4 py-4">
        <form
          onSubmit={handleSearchSubmit}
          className="header-mobile-search mb-4 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <SearchIcon className="h-5 w-5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
          </div>
        </form>

        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Tìm nhanh
          </p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQuickSearch(item)}
                className="rounded-full border border-black/10 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <nav className="space-y-2">
          {visibleNavItems.map((item) => {
            const expanded = mobileExpanded === item.label;

            return (
              <div key={item.label} className="header-mobile-card">
                <div className="flex items-center justify-between bg-white px-4 py-3">
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-semibold text-slate-900"
                  >
                    {item.label}
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpanded((prev) => (prev === item.label ? null : item.label))
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                    aria-label={`Mở ${item.label}`}
                  >
                    <ChevronDownIcon
                      className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {expanded ? (
                  <div className="border-t border-black/6 bg-slate-50 px-4 py-4">
                    <div className="space-y-5">
                      {item.columns?.map((column) => (
                        <div key={column.title}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {column.title}
                          </p>
                          <div className="space-y-2">
                            {column.links?.map((link) => (
                              <Link
                                key={link.label}
                                to={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-sm text-slate-700 transition hover:text-slate-950"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      {item.feature ? (
                        <div className="header-mobile-feature">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                            {item.feature.eyebrow}
                          </p>
                          <p className="mt-2 text-base font-semibold">{item.feature.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/70">
                            {item.feature.description}
                          </p>
                          <Link
                            to={item.feature.ctaHref}
                            onClick={() => setMobileOpen(false)}
                            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                          >
                            {item.feature.ctaLabel}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/cart"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            Giỏ hàng
          </Link>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Đăng nhập
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-3 text-sm font-medium text-white"
            >
              Đăng xuất
            </button>
          )}
        </div>

        {user?.roleName === "ADMIN" ? (
          <Link
            to={adminPath}
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            Vào trang quản lý
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default MobilePanels;