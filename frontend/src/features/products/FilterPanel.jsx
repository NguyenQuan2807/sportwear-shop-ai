import { useMemo, useState } from "react";
import { GENDER_OPTIONS, PRICE_OPTIONS } from "./constants";

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

const CheckboxItem = ({ label, checked, onToggle }) => (
  <label className="flex cursor-pointer items-center gap-3 py-2.5 text-sm text-black">
    <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 rounded border-black/20" />
    <span>{label}</span>
  </label>
);

const FilterSection = ({ title, open, onToggle, children }) => (
  <div className="border-b border-black/10 py-4 last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-sm font-semibold text-black">{title}</span>
      <ChevronIcon open={open} />
    </button>

    {open ? <div className="pt-3">{children}</div> : null}
  </div>
);

const FilterPanel = ({
  formValues,
  categories,
  brands,
  sports,
  filterLoading,
  onApplyFilters,
}) => {
  const [openSections, setOpenSections] = useState({
    gender: true,
    promotion: true,
    price: true,
    brand: true,
    sport: true,
    category: true,
  });

  const selectedPriceValue = useMemo(() => {
    const matched = PRICE_OPTIONS.find(
      (item) =>
        String(item.min) === String(formValues.minPrice || "") &&
        String(item.max) === String(formValues.maxPrice || "")
    );
    return matched?.value || "";
  }, [formValues.minPrice, formValues.maxPrice]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSingleChoice = (name, currentValue, nextValue) => {
    const value = String(currentValue) === String(nextValue) ? "" : nextValue;
    onApplyFilters({ [name]: value });
  };

  const togglePrice = (option) => {
    if (selectedPriceValue === option.value) {
      onApplyFilters({ minPrice: "", maxPrice: "" });
      return;
    }

    onApplyFilters({ minPrice: option.min, maxPrice: option.max });
  };

  return (
    <div className="h-full bg-white">
      <div className="border-b border-black/10 px-4 py-4 sm:px-5 lg:px-6">
        <h2 className="text-base font-semibold text-black">Bộ lọc</h2>
      </div>

      <div className="px-4 pb-6 sm:px-5 lg:px-6">
        <FilterSection title="Giới tính" open={openSections.gender} onToggle={() => toggleSection("gender")}>
          {GENDER_OPTIONS.map((item) => (
            <CheckboxItem
              key={item.value}
              label={item.label}
              checked={formValues.gender === item.value}
              onToggle={() => toggleSingleChoice("gender", formValues.gender, item.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Khuyến mãi" open={openSections.promotion} onToggle={() => toggleSection("promotion")}>
          <CheckboxItem
            label="Đang khuyến mãi"
            checked={formValues.promotionOnly === "true"}
            onToggle={() =>
              onApplyFilters({
                promotionOnly: formValues.promotionOnly === "true" ? "" : "true",
              })
            }
          />
        </FilterSection>

        <FilterSection title="Giá" open={openSections.price} onToggle={() => toggleSection("price")}>
          {PRICE_OPTIONS.map((item) => (
            <CheckboxItem
              key={item.value}
              label={item.label}
              checked={selectedPriceValue === item.value}
              onToggle={() => togglePrice(item)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Hãng" open={openSections.brand} onToggle={() => toggleSection("brand")}>
          {filterLoading ? (
            <p className="py-2 text-sm text-black/45">Đang tải...</p>
          ) : (
            brands.map((item) => (
              <CheckboxItem
                key={item.id}
                label={item.name}
                checked={String(formValues.brandId) === String(item.id)}
                onToggle={() => toggleSingleChoice("brandId", formValues.brandId, String(item.id))}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Môn thể thao" open={openSections.sport} onToggle={() => toggleSection("sport")}>
          {filterLoading ? (
            <p className="py-2 text-sm text-black/45">Đang tải...</p>
          ) : (
            sports.map((item) => (
              <CheckboxItem
                key={item.id}
                label={item.name}
                checked={String(formValues.sportId) === String(item.id)}
                onToggle={() => toggleSingleChoice("sportId", formValues.sportId, String(item.id))}
              />
            ))
          )}
        </FilterSection>

        <FilterSection title="Danh mục" open={openSections.category} onToggle={() => toggleSection("category")}>
          {filterLoading ? (
            <p className="py-2 text-sm text-black/45">Đang tải...</p>
          ) : (
            categories.map((item) => (
              <CheckboxItem
                key={item.id}
                label={item.name}
                checked={String(formValues.categoryId) === String(item.id)}
                onToggle={() => toggleSingleChoice("categoryId", formValues.categoryId, String(item.id))}
              />
            ))
          )}
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterPanel;
