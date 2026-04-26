import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import useWishlist from "../../../hooks/useWishlist";
import { getCategoriesApi } from "../../../services/categoryService";
import { getSportsApi } from "../../../services/sportService";
import { getVisiblePromotionsApi } from "../../../services/promotionService";
import logo from "../../../assets/logo.png";

import {
  buildMegaNavItems,
  quickSearches,
  visibleNavItems as fallbackNavItems,
} from "./header.data";
import useHeaderState from "./useHeaderState";
import useCartCount from "./useCartCount";
import DesktopNav from "./DesktopNav";
import MegaMenuPanel from "./MegaMenuPanel";
import MobilePanels from "./MobilePanels";
import "./header.css";

const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
  </svg>
);

const MenuIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
  </svg>
);

const CartIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M4 5h2l1.2 7.2A2 2 0 0 0 9.18 14H17a2 2 0 0 0 1.95-1.55L20 8H7.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="18.5" r="1.25" />
    <circle cx="17" cy="18.5" r="1.25" />
  </svg>
);

const HeartIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M12 20.2s-6.7-4.35-9.2-8.28C1.22 9.55 2.1 6.5 4.9 5.45c2.02-.76 3.72.05 4.77 1.4L12 9.2l2.33-2.35c1.05-1.35 2.75-2.16 4.77-1.4 2.8 1.05 3.68 4.1 2.1 6.47C18.7 15.85 12 20.2 12 20.2Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Header = () => {
  const { user, logout } = useAuth();
  const cartCount = useCartCount(user);
  const { wishlistCount } = useWishlist();

  const [megaMenuData, setMegaMenuData] = useState({
    categories: [],
    sports: [],
    promotions: [],
  });

  useEffect(() => {
    let ignore = false;

    const fetchMegaMenuData = async () => {
      try {
        const [categoriesRes, sportsRes, promotionsRes] = await Promise.allSettled([
          getCategoriesApi(),
          getSportsApi(),
          getVisiblePromotionsApi(),
        ]);

        if (ignore) return;

        setMegaMenuData({
          categories:
            categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value?.data)
              ? categoriesRes.value.data
              : [],
          sports:
            sportsRes.status === "fulfilled" && Array.isArray(sportsRes.value?.data)
              ? sportsRes.value.data
              : [],
          promotions:
            promotionsRes.status === "fulfilled" && Array.isArray(promotionsRes.value?.data)
              ? promotionsRes.value.data
              : [],
        });
      } catch (error) {
        console.error("Không thể tải dữ liệu mega menu", error);
      }
    };

    fetchMegaMenuData();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleNavItems = useMemo(
    () => buildMegaNavItems(megaMenuData),
    [megaMenuData]
  );

  const {
    mobileOpen,
    setMobileOpen,
    mobileExpanded,
    setMobileExpanded,
    activeMenu,
    setActiveMenu,
    query,
    setQuery,
    utilityMenuOpen,
    setUtilityMenuOpen,
    isAtTop,
    mobileSearchOpen,
    setMobileSearchOpen,
    utilityMenuRef,
    activeMenuData,
    handleSearchSubmit,
    handleQuickSearch,
    isItemActive,
  } = useHeaderState(visibleNavItems.length > 0 ? visibleNavItems : fallbackNavItems);

  const orderPath = "/orders";
  const adminPath = "/admin";
  const profilePath = "/profile";

  const closeMobileSearch = () => setMobileSearchOpen(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  const toggleMobileSearch = () => {
    closeMobileMenu();
    setMobileSearchOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    closeMobileSearch();

    if (mobileOpen) {
      closeMobileMenu();
    } else {
      setMobileExpanded(null);
      setMobileOpen(true);
    }
  };

  return (
    <header className="header-shell sticky top-0 z-50" onMouseLeave={() => setActiveMenu(null)}>
      <div className={`header-utility-wrap hidden lg:block ${isAtTop ? "header-utility-visible" : "header-utility-hidden"}`}>
        <div className="header-utility-shell">
          <div className="mx-auto flex h-9 w-full max-w-[1840px] items-center justify-end gap-4 px-6 xl:px-8">
            {!user ? (
              <Link to="/login" className="header-utility-link">Đăng nhập</Link>
            ) : (
              <div
                className="relative pb-2 -mb-2"
                ref={utilityMenuRef}
                onMouseEnter={() => setUtilityMenuOpen(true)}
                onMouseLeave={() => setUtilityMenuOpen(false)}
              >
                <button type="button" className="header-utility-user inline-flex" onFocus={() => setUtilityMenuOpen(true)}>
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-[180px] truncate">{user?.fullName || user?.username || "Account"}</span>
                </button>

                {utilityMenuOpen ? (
                  <div className="header-utility-dropdown">
                    <Link to={profilePath} className="header-dropdown-link">Tài khoản</Link>
                    <Link to={orderPath} className="header-dropdown-link">Đơn hàng</Link>
                    {user?.roleName === "ADMIN" ? (
                    <Link to={adminPath} className="header-dropdown-link">Quản lý</Link>
                    ) : null}
                    <button type="button" onClick={logout} className="header-dropdown-link header-dropdown-danger w-full text-left">
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-inner mx-auto flex h-[64px] w-full max-w-[1840px] items-center justify-between px-4 sm:px-6 xl:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center justify-start">
          <Link
            to="/"
            onClick={() => {
              closeMobileSearch();
              closeMobileMenu();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="header-logo-link inline-flex items-center"
          >
            <img src={logo} alt="Sportwear Shop" className="h-8 w-auto object-contain sm:h-9" />
          </Link>
        </div>

        <DesktopNav visibleNavItems={visibleNavItems} activeMenu={activeMenu} setActiveMenu={setActiveMenu} isItemActive={isItemActive} />

        <div className="hidden items-center justify-end gap-3 lg:flex">
          <form onSubmit={handleSearchSubmit} className="flex h-11 w-[220px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 shadow-sm">
            <SearchIcon className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" />
          </form>

          <Link to="/wishlist" className="header-mobile-icon-btn relative" aria-label="Yêu thích">
            <HeartIcon className="h-[18px] w-[18px]" />
            {wishlistCount > 0 ? <span className="header-cart-badge">{wishlistCount > 99 ? "99+" : wishlistCount}</span> : null}
          </Link>

          <Link to="/cart" className="header-mobile-icon-btn relative" aria-label="Giỏ hàng">
            <CartIcon className="h-[18px] w-[18px]" />
            {cartCount > 0 ? <span className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span> : null}
          </Link>
        </div>

        <div className="ml-auto flex items-center justify-end gap-1.5 lg:hidden">
          <button type="button" onClick={toggleMobileSearch} className="header-mobile-icon-btn" aria-label="Mở tìm kiếm">
            <SearchIcon className="h-[18px] w-[18px]" />
          </button>

          <Link to="/wishlist" className="header-mobile-icon-btn relative" aria-label="Yêu thích" onClick={() => { closeMobileSearch(); closeMobileMenu(); }}>
            <HeartIcon className="h-[18px] w-[18px]" />
            {wishlistCount > 0 ? <span className="header-cart-badge">{wishlistCount > 99 ? "99+" : wishlistCount}</span> : null}
          </Link>

          <Link to="/cart" className="header-mobile-icon-btn relative" aria-label="Giỏ hàng" onClick={() => { closeMobileSearch(); closeMobileMenu(); }}>
            <CartIcon className="h-[18px] w-[18px]" />
            {cartCount > 0 ? <span className="header-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span> : null}
          </Link>

          <Link to={user ? profilePath : "/login"} className="header-mobile-icon-btn" aria-label="Tài khoản" onClick={() => { closeMobileSearch(); closeMobileMenu(); }}>
            <UserIcon className="h-[18px] w-[18px]" />
          </Link>

          <button type="button" onClick={toggleMobileMenu} className="header-mobile-icon-btn" aria-label="Mở menu">
            <MenuIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-black/5 bg-white px-4 py-3 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="header-mobile-search px-3 py-2.5">
            <div className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-slate-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" />
            </div>
          </form>
        </div>
      ) : null}

      <MegaMenuPanel activeMenuData={activeMenuData} />

      <MobilePanels
        mobileOpen={mobileOpen}
        quickSearches={quickSearches}
        handleQuickSearch={handleQuickSearch}
        visibleNavItems={visibleNavItems}
        mobileExpanded={mobileExpanded}
        setMobileExpanded={setMobileExpanded}
        setMobileOpen={setMobileOpen}
        user={user}
        logout={logout}
        adminPath={adminPath}
      />
    </header>
  );
};

export default Header;
