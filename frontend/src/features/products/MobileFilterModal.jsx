import { useEffect } from "react";
import FilterPanel from "./FilterPanel";

const MobileFilterModal = ({
  open,
  formValues,
  categories,
  brands,
  sports,
  filterLoading,
  onClose,
  onApplyFilters,
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
          <h2 className="text-base font-semibold text-black">Bộ lọc</h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-black">
            Đóng
          </button>
        </div>
        <FilterPanel
          formValues={formValues}
          categories={categories}
          brands={brands}
          sports={sports}
          filterLoading={filterLoading}
          onApplyFilters={onApplyFilters}
        />
      </div>
    </div>
  );
};

export default MobileFilterModal;
