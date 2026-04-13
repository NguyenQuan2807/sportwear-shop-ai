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

const HeartIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M4 5h2l1.2 7.2A2 2 0 0 0 9.18 14H17a2 2 0 0 0 1.95-1.55L20 8H7.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="18.5" r="1.25" />
    <circle cx="17" cy="18.5" r="1.25" />
  </svg>
);

const HeaderActions = ({
  user,
  logout,
  cartCount,
  query,
  setQuery,
  handleSearchSubmit,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  orderPath,
  adminPath,
}) => {
  return (
    <div className="hidden items-center justify-end gap-2 sm:gap-3 lg:flex lg:flex-[0_0_auto]">
      <form
        onSubmit={handleSearchSubmit}
        className="header-search-shell flex px-3"
      >
        <SearchIcon className="h-[18px] w-[18px] text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm"
          className="h-full w-[110px] bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 xl:w-[130px]"
        />
      </form>

      <button
        type="button"
        className="header-action-btn inline-flex"
        aria-label="Yêu thích"
      >
        <HeartIcon />
      </button>

      <Link
        to="/cart"
        className="header-action-btn relative inline-flex"
        aria-label="Giỏ hàng"
      >
        <CartIcon />
        {cartCount > 0 ? (
          <span className="header-cart-badge">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </Link>

      {!user ? (
        <Link to="/login" className="header-login-btn inline-flex">
          Đăng nhập
        </Link>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="header-user-trigger inline-flex"
          >
            <span className="header-user-avatar">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </span>
            <span className="hidden max-w-[120px] truncate text-sm font-semibold xl:inline">
              {user?.fullName || user?.username || "Tài khoản"}
            </span>
            <ChevronDownIcon className="hidden h-4 w-4 xl:block" />
          </button>

          {userMenuOpen ? (
            <div className="header-dropdown">
              <div className="border-b border-black/5 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.fullName || user?.username || "Người dùng"}
                </p>
                {user?.email ? (
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                ) : null}
              </div>

              <div className="p-2">
                <Link
                  to={orderPath}
                  className="header-dropdown-link"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Đơn hàng của tôi
                </Link>

                {user?.roleName === "ADMIN" ? (
                  <Link
                    to={adminPath}
                    className="header-dropdown-link"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Quản lý
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="header-dropdown-link header-dropdown-danger w-full text-left"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HeaderActions;