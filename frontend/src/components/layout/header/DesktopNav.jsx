import { Link } from "react-router-dom";

const DesktopNav = ({ visibleNavItems, activeMenu, setActiveMenu, isItemActive }) => {
  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
      <div className="flex items-center gap-6 xl:gap-8">
        {visibleNavItems.map((item) => {
          const active = activeMenu === item.label || isItemActive(item);

          return (
            <Link
              key={item.label}
              to={item.href}
              onMouseEnter={() => setActiveMenu(item.label)}
              className={`header-nav-link ${active ? "is-active" : ""}`}
            >
              <span className="header-nav-link-label">
                {item.label}
                <span className="header-nav-link-line" />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DesktopNav;