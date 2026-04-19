import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PANEL_TRANSITION_MS = 280;

const MegaMenuPanel = ({ activeMenuData }) => {
  const [renderedMenuData, setRenderedMenuData] = useState(activeMenuData || null);
  const [isOpen, setIsOpen] = useState(Boolean(activeMenuData));

  useEffect(() => {
    if (activeMenuData) {
      setRenderedMenuData(activeMenuData);
      requestAnimationFrame(() => setIsOpen(true));
      return undefined;
    }

    setIsOpen(false);
    const timeoutId = window.setTimeout(() => {
      setRenderedMenuData(null);
    }, PANEL_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeMenuData]);

  const menuData = activeMenuData || renderedMenuData;

  return (
    <div className={`header-mega-wrap hidden lg:block ${isOpen ? "is-open" : "is-closed"}`}>
      <div className="header-mega-shell">
        {menuData ? (
          <div key={menuData.label} className="header-mega-content mx-auto grid max-w-[1760px] grid-cols-[1.7fr_1fr] gap-10 px-8 py-8">
            <div className="grid grid-cols-3 gap-8">
              {menuData.columns?.map((column) => (
                <div key={column.title}>
                  <p className="header-mega-col-title">{column.title}</p>
                  <div className="space-y-2">
                    {column.links?.map((link) => (
                      <Link key={link.label} to={link.href} className="header-mega-link">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="header-feature-card">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                {menuData.feature?.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight">
                {menuData.feature?.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
                {menuData.feature?.description}
              </p>
              <Link to={menuData.feature?.ctaHref || "/products"} className="header-feature-btn mt-6">
                {menuData.feature?.ctaLabel || "Xem thêm"}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MegaMenuPanel;
