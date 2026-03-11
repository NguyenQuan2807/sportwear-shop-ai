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
  };

  const handleResetFilters = () => {
    setFormValues(DEFAULT_FILTERS);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Danh sách sản phẩm</h1>
        <p className="mt-2 text-slate-500">
          Khám phá các sản phẩm thời trang thể thao mới nhất
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 rounded-xl bg-white p-4 shadow lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-800">Bộ lọc</h2>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tìm kiếm
              </label>
              <input
                type="text"
                name="keyword"
                value={formValues.keyword}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={formValues.categoryId}
                onChange={handleSelectFilterChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Thương hiệu
              </label>
              <select
                name="brandId"
                value={formValues.brandId}
                onChange={handleSelectFilterChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Môn thể thao
              </label>
              <select
                name="sportId"
                value={formValues.sportId}
                onChange={handleSelectFilterChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">Tất cả môn thể thao</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Giá từ
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formValues.minPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Đến
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formValues.maxPrice}
                  onChange={handleInputChange}
                  placeholder="1000000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sắp xếp
              </label>
              <select
                name="sort"
                value={formValues.sort}
                onChange={handleSelectFilterChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="nameAsc">Tên A-Z</option>
                <option value="nameDesc">Tên Z-A</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Tìm kiếm
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
              >
                Xóa lọc
              </button>
            </div>
          </form>

          {filterLoading && (
            <p className="text-sm text-slate-500">Đang tải bộ lọc...</p>
          )}
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Tìm thấy <span className="font-semibold">{pageData.totalElements}</span> sản phẩm
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Khám phá các sản phẩm đang bán và chương trình khuyến mãi nổi bật
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                  Có hiển thị giá khuyến mãi
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                  Flash Sale
                </span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="rounded-xl bg-white p-6 text-slate-600 shadow">
              Đang tải sản phẩm...
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && products.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-slate-500 shadow">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}

          {!loading && !errorMessage && products.length > 0 && (
            <>
              {products.some((product) => product.onPromotion) && (
                <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Sản phẩm đang khuyến mãi
                      </h3>
                      <p className="text-sm text-slate-500">
                        Nhiều sản phẩm đang có ưu đãi và flash sale hấp dẫn
                      </p>
                    </div>

                    <div className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                      Deal nổi bật
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pageData.page - 1)}
                  disabled={pageData.page === 0}
                  className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>

                {Array.from({ length: pageData.totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index)}
                    className={`rounded-lg px-4 py-2 ${
                      pageData.page === index
                        ? "bg-blue-600 text-white"
                        : "border bg-white text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pageData.page + 1)}
                  disabled={pageData.last}
                  className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;