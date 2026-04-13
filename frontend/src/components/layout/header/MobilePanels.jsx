import { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

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
  const closeMobileMenu = () => {
    setMobileExpanded(null);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] lg:hidden ${
        mobileOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeMobileMenu}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute right-0 top-0 h-dvh w-[50vw] min-w-[220px] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Menu</p>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
            >
              Đóng
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-3 py-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickSearches.slice(0, 3).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    handleQuickSearch(item);
                    closeMobileMenu();
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {item}
                </button>
              ))}
            </div>

            <nav className="space-y-2">
              {visibleNavItems.map((item) => {
                const expanded = mobileExpanded === item.label;

                return (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className="text-sm font-semibold text-slate-900"
                      >
                        {item.label}
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded((prev) =>
                            prev === item.label ? null : item.label
                          )
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600"
                        aria-label={`${expanded ? "Đóng" : "Mở"} ${item.label}`}
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {expanded ? (
                      <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="space-y-3">
                          {item.columns?.map((column) => (
                            <div key={column.title}>
                              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                {column.title}
                              </p>

                              <div className="space-y-1.5">
                                {column.links?.slice(0, 4).map((link) => (
                                  <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={closeMobileMenu}
                                    className="block text-xs text-slate-700"
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            {!user ? (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/orders"
                  onClick={closeMobileMenu}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Orders
                </Link>

                {user?.roleName === "ADMIN" ? (
                  <Link
                    to={adminPath}
                    onClick={closeMobileMenu}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Quản lý
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default MobilePanels;