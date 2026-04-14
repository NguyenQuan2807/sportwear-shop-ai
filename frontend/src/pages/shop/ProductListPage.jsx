import FilterPanel from "../../features/products/FilterPanel";
import MobileFilterModal from "../../features/products/MobileFilterModal";
import ProductGrid from "../../features/products/ProductGrid";
import ProductPagination from "../../features/products/ProductPagination";
import {
  ProductHero,
  ProductResultSummary,
  PromotionBanner,
} from "../../features/products/ProductToolbar";
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
    activeFilterChips,
    selectedSortLabel,
    hasPromotion,
    setMobileFilterOpen,
    handleInputChange,
    handleSearchSubmit,
    handleSelectFilterChange,
    handlePageChange,
    handleResetFilters,
    handleRemoveChip,
  } = useProductCatalog();

  return (
    <div className="min-h-screen bg-slate-50">
      <ProductHero
        totalElements={pageData.totalElements}
        pageSize={pageData.size}
        currentPage={pageData.page + 1}
        totalPages={pageData.totalPages}
        selectedSortLabel={selectedSortLabel}
        mobileFilterOpen={mobileFilterOpen}
        onToggleMobileFilter={() => setMobileFilterOpen((prev) => !prev)}
      />

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 xl:px-8">
        <div className="flex gap-6 xl:gap-8">
          <aside className="hidden w-[320px] shrink-0 lg:block">
            <FilterPanel
              formValues={formValues}
              categories={categories}
              brands={brands}
              sports={sports}
              filterLoading={filterLoading}
              onInputChange={handleInputChange}
              onSearchSubmit={handleSearchSubmit}
              onSelectChange={handleSelectFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <ProductResultSummary
              totalElements={pageData.totalElements}
              currentCount={products.length}
              sortValue={filters.sort}
              activeFilterChips={activeFilterChips}
              onSortChange={handleSelectFilterChange}
              onRemoveChip={handleRemoveChip}
              onResetFilters={handleResetFilters}
            />

            <PromotionBanner
              hasPromotion={hasPromotion}
              loading={loading}
              errorMessage={errorMessage}
            />

            <ProductGrid
              loading={loading}
              errorMessage={errorMessage}
              products={products}
              onResetFilters={handleResetFilters}
            />

            {!loading && !errorMessage && products.length > 0 ? (
              <ProductPagination
                page={pageData.page}
                totalPages={pageData.totalPages}
                last={pageData.last}
                onPageChange={handlePageChange}
              />
            ) : null}
          </main>
        </div>
      </section>

      <MobileFilterModal
        open={mobileFilterOpen}
        formValues={formValues}
        categories={categories}
        brands={brands}
        sports={sports}
        filterLoading={filterLoading}
        onClose={() => setMobileFilterOpen(false)}
        onInputChange={handleInputChange}
        onSearchSubmit={handleSearchSubmit}
        onSelectChange={handleSelectFilterChange}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default ProductListPage;
