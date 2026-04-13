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

const HeaderActions = ({ cartCount, query, setQuery, handleSearchSubmit }) => {
  return (
    <div className="hidden items-center justify-end gap-1.5 lg:flex">
      <form
        onSubmit={handleSearchSubmit}
        className="header-search-shell flex px-2.5"
      >
        <SearchIcon className="h-[16px] w-[16px] text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm"
          className="h-full w-[88px] bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 xl:w-[108px]"
        />
      </form>

      <button
        type="button"
        className="header-action-btn inline-flex"
        aria-label="Yêu thích"
      >
        <HeartIcon className="h-[18px] w-[18px]" />
      </button>

      <Link
        to="/cart"
        className="header-action-btn relative inline-flex"
        aria-label="Giỏ hàng"
      >
        <CartIcon className="h-[18px] w-[18px]" />
        {cartCount > 0 ? (
          <span className="header-cart-badge">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </Link>
      </div>
  );
};

export default HeaderActions;