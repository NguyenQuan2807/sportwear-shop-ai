import { useState } from "react";
import CatalogTopBar from "../../features/products/CatalogTopBar";
import FilterPanel from "../../features/products/FilterPanel";
import MobileFilterModal from "../../features/products/MobileFilterModal";
import ProductGrid from "../../features/products/ProductGrid";
import ProductPagination from "../../features/products/ProductPagination";
import { useProductCatalog } from "../../features/products/useProductCatalog";

const ProductListPage = () => {
  const {
    filters,
    formValues,
    products,
    pageData,
    categories,
    brands,
    sports,
    loading,
    filterLoading,
    errorMessage,
    mobileFilterOpen,
    selectedSortLabel,
    setMobileFilterOpen,
    applyFilters,
    handlePageChange,
  } = useProductCatalog();

  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);

  const handleToggleFilters = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setDesktopFiltersOpen((prev) => !prev);
      return;
    }

    setMobileFilterOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <CatalogTopBar
        totalElements={pageData.totalElements}
        filtersOpen={desktopFiltersOpen || mobileFilterOpen}
        selectedSortLabel={selectedSortLabel}
        sortValue={filters.sort}
        onToggleFilters={handleToggleFilters}
        onSortSelect={(value) => applyFilters({ sort: value })}
      />

      <section className="flex w-full">
        {desktopFiltersOpen ? (
          <aside className="hidden w-[290px] shrink-0 border-r border-black/10 lg:block xl:w-[320px]">
            <FilterPanel
              formValues={formValues}
              categories={categories}
              brands={brands}
              sports={sports}
              filterLoading={filterLoading}
              onApplyFilters={applyFilters}
            />
          </aside>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ProductGrid loading={loading} errorMessage={errorMessage} products={products} />
          {!loading && !errorMessage && products.length > 0 ? (
            <ProductPagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              last={pageData.last}
              onPageChange={handlePageChange}
            />
          ) : null}
        </main>
      </section>

      <MobileFilterModal
        open={mobileFilterOpen}
        formValues={formValues}
        categories={categories}
        brands={brands}
        sports={sports}
        filterLoading={filterLoading}
        onClose={() => setMobileFilterOpen(false)}
        onApplyFilters={applyFilters}
      />
    </div>
  );
};

export default ProductListPage;
