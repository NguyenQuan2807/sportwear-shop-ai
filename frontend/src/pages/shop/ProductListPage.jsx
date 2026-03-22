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

  const fetchFilterData = async () => {
    try {
      setFilterLoading(true);

      const [categoriesRes, brandsRes, sportsRes] = await Promise.all([
        getCategoriesApi(),
        getBrandsApi(),
        getSportsApi(),
      ]);

      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
      setSports(sportsRes.data || []);
    } catch (error) {
      console.error("Không thể tải dữ liệu bộ lọc", error);
    } finally {
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
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

    updateSearchParams({
      page: newPage,
    });

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
    const brand = brands.find((item) => String(item.id) === String(filters.brandId));
    const sport = sports.find((item) => String(item.id) === String(filters.sportId));

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

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 text-white shadow-2xl">
        <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Sportwear Collection
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Danh sách sản phẩm thể thao dành cho mọi phong cách vận động
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Tìm kiếm nhanh theo danh mục, thương hiệu, môn thể thao và khoảng giá.
              Toàn bộ trải nghiệm đã được tối ưu responsive cho desktop, tablet và mobile.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                {pageData.totalElements} sản phẩm
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                Sort: {selectedSortLabel}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickStat
                label="Danh mục"
                value={categories.length}
                subtext="Loại sản phẩm"
              />
              <QuickStat
                label="Thương hiệu"
                value={brands.length}
                subtext="Brand nổi bật"
              />
              <QuickStat
                label="Môn thể thao"
                value={sports.length}
                subtext="Nhu cầu luyện tập"
              />
              <QuickStat
                label="Hiển thị"
                value={products.length}
                subtext="Sản phẩm trang này"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <FilterIcon />
          <span>{mobileFilterOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}</span>
        </button>

        <select
          name="sort"
          value={formValues.sort}
          onChange={handleSelectFilterChange}
          className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sắp xếp: {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } xl:block`}
        >
          <div className="sticky top-28 rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  Filter Panel
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  Bộ lọc sản phẩm
                </h2>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Xóa lọc
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-5">
              <FilterBlock label="Từ khóa">
                <input
                  type="text"
                  name="keyword"
                  value={formValues.keyword}
                  onChange={handleInputChange}
                  placeholder="Tìm tên sản phẩm..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                />
              </FilterBlock>

              <FilterBlock label="Danh mục">
                <select
                  name="categoryId"
                  value={formValues.categoryId}
                  onChange={handleSelectFilterChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
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
                  onChange={handleSelectFilterChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
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
                  onChange={handleSelectFilterChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
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
                    name="minPrice"
                    value={formValues.minPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  />
                </FilterBlock>

                <FilterBlock label="Đến">
                  <input
                    type="number"
                    name="maxPrice"
                    value={formValues.maxPrice}
                    onChange={handleInputChange}
                    placeholder="5000000"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  />
                </FilterBlock>
              </div>

              <FilterBlock label="Sắp xếp">
                <select
                  name="sort"
                  value={formValues.sort}
                  onChange={handleSelectFilterChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FilterBlock>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Áp dụng
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Đặt lại
                </button>
              </div>
            </form>

            {filterLoading && (
              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Đang tải dữ liệu bộ lọc...
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                  Product Result
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  Có {pageData.totalElements} sản phẩm phù hợp
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Hiển thị {products.length} sản phẩm trên trang hiện tại. Trải nghiệm
                  lọc và sắp xếp được tối ưu cho cả mobile và desktop.
                </p>
              </div>

              <div className="hidden lg:block">
                <select
                  name="sort"
                  value={formValues.sort}
                  onChange={handleSelectFilterChange}
                  className="h-12 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sắp xếp: {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => handleRemoveChip(chip.key)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <span>{chip.label}</span>
                    <span className="text-slate-400">✕</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {products.some((product) => product.onPromotion) && !loading && !errorMessage && (
            <div className="rounded-[28px] border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                    Promotion
                  </p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                    Có sản phẩm đang khuyến mãi trong danh sách này
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Một số sản phẩm đang có ưu đãi đặc biệt hoặc nằm trong Flash Sale.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                  Deal nổi bật
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="aspect-[4/4.4] animate-pulse rounded-[22px] bg-slate-200" />
                  <div className="mt-4 space-y-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && products.length === 0 && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FilterIcon />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Không tìm thấy sản phẩm phù hợp
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Hãy thử đổi từ khóa, nới rộng khoảng giá hoặc xóa bớt bộ lọc để xem nhiều sản phẩm hơn.
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {!loading && !errorMessage && products.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pageData.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handlePageChange(pageData.page - 1)}
                    disabled={pageData.page === 0}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>

                  {Array.from({ length: pageData.totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`min-w-[44px] rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        pageData.page === index
                          ? "bg-slate-900 text-white shadow-lg"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pageData.page + 1)}
                    disabled={pageData.last}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const FilterBlock = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const QuickStat = ({ label, value, subtext }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">{label}</p>
    <div className="mt-2 text-3xl font-black">{value}</div>
    <p className="mt-1 text-sm text-white/70">{subtext}</p>
  </div>
);

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 4.99 2.235 4.99 4.99 0 .65-.125 1.272-.353 1.843l3.363 3.363a1.5 1.5 0 0 1-1.06 2.56H5.06A1.5 1.5 0 0 1 4 13.196l3.364-3.363a4.99 4.99 0 1 1 4.636-6.833Z"
    />
  </svg>
);

export default ProductListPage;