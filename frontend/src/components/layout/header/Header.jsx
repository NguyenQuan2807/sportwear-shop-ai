import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import logo from "../../../assets/logo.png";

import { quickSearches, visibleNavItems } from "./header.data";
import useHeaderState from "./useHeaderState";
import useCartCount from "./useCartCount";
import DesktopNav from "./DesktopNav";
import HeaderActions from "./HeaderActions";
import MegaMenuPanel from "./MegaMenuPanel";
import MobilePanels from "./MobilePanels";
import "./header.css";

const MenuIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
  </svg>
);

const CloseIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
    aria-hidden="true"
  >
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

const Header = () => {
  const { user, logout } = useAuth();
  const cartCount = useCartCount(user);

  const {
    mobileOpen,
    setMobileOpen,
    mobileExpanded,
    setMobileExpanded,
    activeMenu,
    setActiveMenu,
    query,
    setQuery,
    userMenuOpen,
    setUserMenuOpen,
    userMenuRef,
    activeMenuData,
    handleSearchSubmit,
    handleQuickSearch,
    isItemActive,
  } = useHeaderState();

  const orderPath = "/orders";
  const adminPath = "/admin";

  return (
    <header
      className="header-shell sticky top-0 z-50"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="header-inner mx-auto flex h-[72px] w-full max-w-[1840px] items-center justify-between px-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:flex-[0_0_auto]">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="header-action-btn inline-flex lg:hidden"
            aria-label="Mở menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="header-logo-link inline-flex items-center"
          >
            <img
              src={logo}
              alt="Sportwear Shop"
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>
        </div>

        <DesktopNav
          visibleNavItems={visibleNavItems}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isItemActive={isItemActive}
        />

        <HeaderActions
          user={user}
          logout={logout}
          cartCount={cartCount}
          query={query}
          setQuery={setQuery}
          handleSearchSubmit={handleSearchSubmit}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          userMenuRef={userMenuRef}
          orderPath={orderPath}
          adminPath={adminPath}
        />
      </div>

      <MegaMenuPanel activeMenuData={activeMenuData} />

      <MobilePanels
        mobileOpen={mobileOpen}
        query={query}
        setQuery={setQuery}
        handleSearchSubmit={handleSearchSubmit}
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