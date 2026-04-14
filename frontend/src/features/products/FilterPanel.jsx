import { SORT_OPTIONS } from "./constants";

const FilterBlock = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-slate-800">{label}</label>
    {children}
  </div>
);

const FilterPanel = ({
  mobile = false,
  formValues,
  categories,
  brands,
  sports,
  filterLoading,
  onInputChange,
  onSearchSubmit,
  onSelectChange,
  onReset,
}) => {
  return (
    <div
      className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${
        mobile ? "" : "sticky top-24"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Filter Panel
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Bộ lọc sản phẩm
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Xóa lọc
        </button>
      </div>

      <form onSubmit={onSearchSubmit} className="mt-6 space-y-5">
        <FilterBlock label="Từ khóa">
          <input
            type="text"
            name="keyword"
            value={formValues.keyword}
            onChange={onInputChange}
            placeholder="Nhập tên sản phẩm..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </FilterBlock>

        <FilterBlock label="Danh mục">
          <select
            name="categoryId"
            value={formValues.categoryId}
            onChange={onSelectChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterBlock>

        <FilterBlock label="Thương hiệu">
          <select
            name="brandId"
            value={formValues.brandId}
            onChange={onSelectChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </FilterBlock>

        <FilterBlock label="Môn thể thao">
          <select
            name="sportId"
            value={formValues.sportId}
            onChange={onSelectChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Tất cả môn thể thao</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </FilterBlock>

        <div className="grid grid-cols-2 gap-3">
          <FilterBlock label="Giá từ">
            <input
              type="number"
              min="0"
              name="minPrice"
              value={formValues.minPrice}
              onChange={onInputChange}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </FilterBlock>

          <FilterBlock label="Đến">
            <input
              type="number"
              min="0"
              name="maxPrice"
              value={formValues.maxPrice}
              onChange={onInputChange}
              placeholder="9999999"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </FilterBlock>
        </div>

        <FilterBlock label="Sắp xếp">
          <select
            name="sort"
            value={formValues.sort}
            onChange={onSelectChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sắp xếp: {option.label}
              </option>
            ))}
          </select>
        </FilterBlock>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Áp dụng
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Đặt lại
          </button>
        </div>

        {filterLoading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Đang tải dữ liệu bộ lọc...
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default FilterPanel;
