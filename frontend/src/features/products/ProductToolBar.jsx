import { SORT_OPTIONS } from "./constants";

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
  </svg>
);

export const ProductHero = ({ totalElements, onToggleMobileFilter }) => {
  const totalLabel = Number(totalElements || 0).toLocaleString("vi-VN");

  return (
    <section className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Sportwear Shop
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
              All Products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
              Bản làm lại theo tinh thần Nike: nhiều khoảng thở, typography đậm, card lớn,
              nền sạch và tập trung vào ảnh sản phẩm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              {totalLabel} sản phẩm
            </span>
            <button
              type="button"
              onClick={onToggleMobileFilter}
              className="inline-flex items-center gap-2 rounded-full border border-black/12 px-5 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-black hover:text-white lg:hidden"
            >
              <FilterIcon />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProductResultSummary = ({
  totalElements,
  currentCount,
  selectedSortLabel,
  sortValue,
  activeFilterChips,
  onSortChange,
  onRemoveChip,
  onResetFilters,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-black/8 bg-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
            Catalog view
          </p>
          <p className="mt-2 text-sm text-black/60 sm:text-base">
            Hiển thị <span className="font-semibold text-black">{currentCount}</span> / {" "}
            <span className="font-semibold text-black">
              {Number(totalElements || 0).toLocaleString("vi-VN")}
            </span>{" "}
            sản phẩm
          </p>
        </div>

        <label className="inline-flex items-center gap-3 rounded-full border border-black/10 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
            Sort
          </span>
          <select
            name="sort"
            value={sortValue}
            onChange={onSortChange}
            className="bg-transparent text-sm font-semibold text-black outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeFilterChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemoveChip(chip.key)}
              className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-black/[0.03] px-4 py-2 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
            >
              <span>{chip.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onResetFilters}
            className="px-1 py-2 text-sm font-semibold text-black/50 transition hover:text-black"
          >
            Xóa tất cả
          </button>
        </div>
      ) : (
        <div className="rounded-full border border-dashed border-black/10 px-4 py-3 text-sm text-black/45">
          Đang sắp xếp theo <span className="font-semibold text-black">{selectedSortLabel}</span>
        </div>
      )}
    </section>
  );
};

export const PromotionBanner = ({ hasPromotion, loading, errorMessage }) => {
  if (loading || errorMessage || !hasPromotion) return null;

  return (
    <section className="overflow-hidden rounded-[32px] bg-black text-white">
      <div className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Promotion now
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl">
            Ưu đãi đang diễn ra trong catalog này
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            Tập trung vào các mẫu đang giảm giá để tạo cảm giác giống trải nghiệm storefront
            hiện đại kiểu Nike nhưng vẫn bám đúng dữ liệu thật từ API của bạn.
          </p>
        </div>
        <div className="inline-flex h-fit rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85">
          Ưu tiên sản phẩm đang sale
        </div>
      </div>
    </section>
  );
};
