import { Link } from "react-router-dom";

const MegaMenuPanel = ({ activeMenuData }) => {
  if (!activeMenuData) return null;

  return (
    <div className="header-mega-shell hidden lg:block">
      <div className="mx-auto grid max-w-[1760px] grid-cols-[1.7fr_1fr] gap-10 px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {activeMenuData.columns?.map((column) => (
            <div key={column.title}>
              <p className="header-mega-col-title">{column.title}</p>
              <div className="space-y-2">
                {column.links?.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="header-mega-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="header-feature-card">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">
            {activeMenuData.feature?.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight">
            {activeMenuData.feature?.title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            {activeMenuData.feature?.description}
          </p>
          <Link
            to={activeMenuData.feature?.ctaHref || "/products"}
            className="header-feature-btn mt-6"
          >
            {activeMenuData.feature?.ctaLabel || "Xem thêm"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuPanel;