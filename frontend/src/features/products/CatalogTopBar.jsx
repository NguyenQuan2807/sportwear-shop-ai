import { useEffect, useRef, useState } from "react";
import { SORT_OPTIONS } from "./constants";

const ChevronIcon = ({ open = false }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
  </svg>
);

const CatalogTopBar = ({ totalElements, filtersOpen, selectedSortLabel, sortValue, onToggleFilters, onSortSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-4 sm:px-6 lg:px-8">
      <p className="text-base font-semibold text-black sm:text-lg">
        {Number(totalElements || 0).toLocaleString("vi-VN")} sản phẩm
      </p>

      <div className="flex items-center gap-5 sm:gap-6">
        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black transition hover:opacity-70"
        >
          <FilterIcon />
          <span>{filtersOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-black transition hover:opacity-70"
          >
            <span>Sắp xếp</span>
            <ChevronIcon open={menuOpen} />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-full z-20 mt-3 w-60 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
              {SORT_OPTIONS.map((option) => {
                const active = option.value === sortValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortSelect(option.value);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active ? "bg-black text-white" : "text-black hover:bg-black/[0.04]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {active ? <span aria-hidden="true">•</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CatalogTopBar;
