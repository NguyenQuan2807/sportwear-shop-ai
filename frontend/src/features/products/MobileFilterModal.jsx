import FilterPanel from "./FilterPanel";

const MobileFilterModal = ({
  open,
  formValues,
  categories,
  brands,
  sports,
  filterLoading,
  onClose,
  onInputChange,
  onSearchSubmit,
  onSelectChange,
  onReset,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm lg:hidden">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Mobile Filter
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Bộ lọc sản phẩm
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <FilterPanel
          mobile
          formValues={formValues}
          categories={categories}
          brands={brands}
          sports={sports}
          filterLoading={filterLoading}
          onInputChange={onInputChange}
          onSearchSubmit={onSearchSubmit}
          onSelectChange={onSelectChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
};

export default MobileFilterModal;
