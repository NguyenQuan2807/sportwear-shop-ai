import { SORT_OPTIONS } from "./constants";

const QuickStat = ({ label, value, subtext }) => (
  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{subtext}</p>
  </div>
);

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <path
      d="M4 6h16M7 12h10m-7 6h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProductHero = ({
  totalElements,
  pageSize,
  currentPage,
  totalPages,
  selectedSortLabel,
  mobileFilterOpen,
  onToggleMobileFilter,
}) => (
  <section className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-8 sm:px-6 xl:px-8 xl:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sportwear Collection
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Danh sách sản phẩm thể thao dành cho mọi phong cách vận động
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Tìm kiếm nhanh theo danh mục, thương hiệu, môn thể thao và khoảng giá.
            Toàn bộ trải nghiệm đã được tối ưu responsive cho desktop, tablet và mobile.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {totalElements} sản phẩm
          </div>

          <div className="hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 lg:inline-flex">
            Sort: {selectedSortLabel}
          </div>

          <button
            type="button"
            onClick={onToggleMobileFilter}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 lg:hidden"
          >
            <FilterIcon />
            {mobileFilterOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickStat
          label="Tổng sản phẩm"
          value={totalElements}
          subtext="Danh mục đang hiển thị"
        />
        <QuickStat
          label="Hiển thị mỗi trang"
          value={pageSize}
          subtext="Tối ưu cho trải nghiệm duyệt"
        />
        <QuickStat
          label="Trang hiện tại"
          value={currentPage}
          subtext={`Tổng ${Math.max(totalPages, 1)} trang`}
        />
      </div>
    </div>
  </section>
);

export const ProductResultSummary = ({
  totalElements,
  currentCount,
  sortValue,
  activeFilterChips,
  onSortChange,
  onRemoveChip,
  onResetFilters,
}) => {
  const currentSortLabel =
    SORT_OPTIONS.find((item) => item.value === sortValue)?.label || "Mới nhất";

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Product Result
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Có {totalElements} sản phẩm phù hợp
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Hiển thị {currentCount} sản phẩm trên trang hiện tại. Trải nghiệm lọc và
            sắp xếp được tối ưu cho cả mobile và desktop.
          </p>
        </div>

        <div className="hidden lg:block">
          <select
            name="sort"
            value={sortValue}
            onChange={onSortChange}
            aria-label={`Sắp xếp hiện tại: ${currentSortLabel}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-slate-400"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sắp xếp: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilterChips.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemoveChip(chip.key)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {chip.label}
              <span aria-hidden="true">✕</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Xóa tất cả
          </button>
        </div>
      ) : null}
    </section>
  );
};

export const PromotionBanner = ({ hasPromotion, loading, errorMessage }) => {
  if (!hasPromotion || loading || errorMessage) return null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
        Promotion
      </p>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            Có sản phẩm đang khuyến mãi trong danh sách này
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Một số sản phẩm đang có ưu đãi đặc biệt hoặc nằm trong Flash Sale.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Deal nổi bật
        </div>
      </div>
    </section>
  );
}; 
