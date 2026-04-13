import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import ProductCard from "../../components/product/ProductCard";

const DEFAULT_FILTERS = {
  keyword: "",
  categoryId: "",
  brandId: "",
  sportId: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 0,
  size: 12,
};

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "nameAsc", label: "Tên A-Z" },
  { value: "nameDesc", label: "Tên Z-A" },
];

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pageData, setPageData] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters = useMemo(() => {
    return {
      keyword: searchParams.get("keyword") || "",
      categoryId: searchParams.get("categoryId") || "",
      brandId: searchParams.get("brandId") || "",
      sportId: searchParams.get("sportId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 0),
      size: Number(searchParams.get("size") || 12),
    };
  }, [searchParams]);

  const [formValues, setFormValues] = useState(filters);

  useEffect(() => {
    setFormValues(filters);
  }, [filters]);

  const buildParams = () => {
    const params = {
      page: filters.page,
      size: filters.size,
      sort: filters.sort,
    };

    if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.sportId) params.sportId = filters.sportId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    return params;
  };

  const updateSearchParams = (nextValues) => {
    const merged = {
      ...filters,
      ...nextValues,
    };

    const params = {};

    if (merged.keyword) params.keyword = merged.keyword;
    if (merged.categoryId) params.categoryId = merged.categoryId;
    if (merged.brandId) params.brandId = merged.brandId;
    if (merged.sportId) params.sportId = merged.sportId;
    if (merged.minPrice) params.minPrice = merged.minPrice;
    if (merged.maxPrice) params.maxPrice = merged.maxPrice;
    if (merged.sort && merged.sort !== "newest") params.sort = merged.sort;
    if (merged.page && merged.page !== 0) params.page = String(merged.page);
    if (merged.size && merged.size !== 12) params.size = String(merged.size);

    setSearchParams(params);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterLoading(true);

        const [categoriesRes, brandsRes, sportsRes] = await Promise.all([
          getCategoriesApi(),
          getBrandsApi(),
          getSportsApi(),
        ]);

        setCategories(categoriesRes?.data || []);
        setBrands(brandsRes?.data || []);
        setSports(sportsRes?.data || []);
      } catch (error) {
        console.error("Không thể tải dữ liệu bộ lọc", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getProductsApi(buildParams());
        const data = response?.data || {};

        setProducts(Array.isArray(data.content) ? data.content : []);
        setPageData({
          page: data.page ?? 0,
          size: data.size ?? 12,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          last: data.last ?? true,
        });
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message || "Không thể tải danh sách sản phẩm";
        setErrorMessage(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    if (filterLoading) return;

    const legacyCategory = searchParams.get("category");
    const legacyBrand = searchParams.get("brand");
    const legacySport = searchParams.get("sport");

    let needUpdate = false;
    const nextParams = new URLSearchParams(searchParams);

    if (legacyCategory && !searchParams.get("categoryId")) {
      const matchedCategory = categories.find(
        (item) => normalizeText(item.name) === normalizeText(legacyCategory)
      );

      if (matchedCategory) {
        nextParams.set("categoryId", String(matchedCategory.id));
        nextParams.delete("category");
        needUpdate = true;
      }
    }

    if (legacyBrand && !searchParams.get("brandId")) {
      const matchedBrand = brands.find(
        (item) => normalizeText(item.name) === normalizeText(legacyBrand)
      );

      if (matchedBrand) {
        nextParams.set("brandId", String(matchedBrand.id));
        nextParams.delete("brand");
        needUpdate = true;
      }
    }

    if (legacySport && !searchParams.get("sportId")) {
      const matchedSport = sports.find(
        (item) => normalizeText(item.name) === normalizeText(legacySport)
      );

      if (matchedSport) {
        nextParams.set("sportId", String(matchedSport.id));
        nextParams.delete("sport");
        needUpdate = true;
      }
    }

    if (needUpdate) {
      setSearchParams(nextParams);
    }
  }, [filterLoading, categories, brands, sports, searchParams, setSearchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearchParams({
      ...formValues,
      page: 0,
    });
    setMobileFilterOpen(false);
  };

  const handleSelectFilterChange = (e) => {
    const { name, value } = e.target;

    const nextValues = {
      ...formValues,
      [name]: value,
      page: 0,
    };

    setFormValues(nextValues);
    updateSearchParams(nextValues);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= pageData.totalPages) return;

    updateSearchParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setFormValues(DEFAULT_FILTERS);
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const activeFilterChips = useMemo(() => {
    const category = categories.find(
      (item) => String(item.id) === String(filters.categoryId)
    );
    const brand = brands.find(
      (item) => String(item.id) === String(filters.brandId)
    );
    const sport = sports.find(
      (item) => String(item.id) === String(filters.sportId)
    );

    const chips = [];

    if (filters.keyword) {
      chips.push({
        key: "keyword",
        label: `Từ khóa: ${filters.keyword}`,
      });
    }

    if (category) {
      chips.push({
        key: "categoryId",
        label: `Danh mục: ${category.name}`,
      });
    }

    if (brand) {
      chips.push({
        key: "brandId",
        label: `Thương hiệu: ${brand.name}`,
      });
    }

    if (sport) {
      chips.push({
        key: "sportId",
        label: `Môn thể thao: ${sport.name}`,
      });
    }

    if (filters.minPrice) {
      chips.push({
        key: "minPrice",
        label: `Giá từ: ${Number(filters.minPrice).toLocaleString("vi-VN")}đ`,
      });
    }

    if (filters.maxPrice) {
      chips.push({
        key: "maxPrice",
        label: `Đến: ${Number(filters.maxPrice).toLocaleString("vi-VN")}đ`,
      });
    }

    return chips;
  }, [filters, categories, brands, sports]);

  const handleRemoveChip = (key) => {
    updateSearchParams({
      [key]: "",
      page: 0,
    });
  };

  const selectedSortLabel =
    SORT_OPTIONS.find((item) => item.value === filters.sort)?.label || "Mới nhất";

  const hasPromotion = products.some((product) => product.onPromotion);

  return (
    <div className="min-h-screen bg-slate-50">
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
                {pageData.totalElements} sản phẩm
              </div>

              <div className="hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 lg:inline-flex">
                Sort: {selectedSortLabel}
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen((prev) => !prev)}
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
              value={pageData.totalElements}
              subtext="Danh mục đang hiển thị"
            />
            <QuickStat
              label="Hiển thị mỗi trang"
              value={pageData.size}
              subtext="Tối ưu cho trải nghiệm duyệt"
            />
            <QuickStat
              label="Trang hiện tại"
              value={pageData.page + 1}
              subtext={`Tổng ${Math.max(pageData.totalPages, 1)} trang`}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 xl:px-8">
        <div className="flex gap-6 xl:gap-8">
          <aside className="hidden w-[320px] shrink-0 lg:block">
            <FilterPanel
              mobile={false}
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
              formValues={formValues}
              activeFilterChips={activeFilterChips}
              onSelectChange={handleSelectFilterChange}
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

const ProductResultSummary = ({
  totalElements,
  currentCount,
  formValues,
  activeFilterChips,
  onSelectChange,
  onRemoveChip,
  onResetFilters,
}) => {
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
            value={formValues.sort}
            onChange={onSelectChange}
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

const PromotionBanner = ({ hasPromotion, loading, errorMessage }) => {
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

const ProductGrid = ({ loading, errorMessage, products, onResetFilters }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse rounded-[22px] bg-slate-100" />
            <div className="mt-4 h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {errorMessage}
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-950">
          Không tìm thấy sản phẩm phù hợp
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Hãy thử đổi từ khóa, nới rộng khoảng giá hoặc xóa bớt bộ lọc để xem nhiều
          sản phẩm hơn.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Xóa bộ lọc
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
};

const ProductPagination = ({ page, totalPages, last, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <section className="flex flex-wrap items-center justify-center gap-2 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Trước
      </button>

      {Array.from({ length: totalPages }, (_, index) => index).map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPageChange(index)}
          className={`min-w-[44px] rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            page === index
              ? "bg-slate-900 text-white shadow-lg"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={last}
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sau
      </button>
    </section>
  );
};

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

const FilterBlock = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-slate-800">{label}</label>
    {children}
  </div>
);

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

export default ProductListPage;