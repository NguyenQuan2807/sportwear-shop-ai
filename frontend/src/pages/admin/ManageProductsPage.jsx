import { useEffect, useMemo, useState } from "react";
import {
  createAdminProductApi,
  deleteAdminProductApi,
  getAdminProductDetailApi,
  getAdminProductsApi,
  updateAdminProductApi,
} from "../../services/adminProductService";
import { getAdminBrandsApi } from "../../services/adminBrandService";
import { getAdminCategoriesApi } from "../../services/adminCategoryService";
import { getAdminSportsApi } from "../../services/adminSportService";
import AdminProductForm from "../../components/product/AdminProductForm";
import AdminProductVariantManager from "../../components/product/AdminProductVariantManager";
import AdminProductImageManager from "../../components/product/AdminProductImageManager";

const defaultFilters = {
  keyword: "",
  categoryId: "",
  brandId: "",
  sportId: "",
  gender: "",
  isActive: "",
  sort: "newest",
};

const genderOptions = [
  { value: "", label: "Tất cả giới tính" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "UNISEX", label: "Unisex" },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang bán" },
  { value: "false", label: "Ngừng bán" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name_asc", label: "Tên A-Z" },
  { value: "name_desc", label: "Tên Z-A" },
  { value: "updated_desc", label: "Cập nhật gần nhất" },
];

const genderLabelMap = {
  MALE: "Nam",
  FEMALE: "Nữ",
  UNISEX: "Unisex",
};

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
  const [imageProduct, setImageProduct] = useState(null);

  const [filters, setFilters] = useState(defaultFilters);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "sort" && value !== ""
    ).length;
  }, [filters]);

  const buildProductParams = (sourceFilters) => {
    const params = {
      sort: sourceFilters.sort || "newest",
    };

    if (sourceFilters.keyword?.trim()) {
      params.keyword = sourceFilters.keyword.trim();
    }

    if (sourceFilters.categoryId) {
      params.categoryId = Number(sourceFilters.categoryId);
    }

    if (sourceFilters.brandId) {
      params.brandId = Number(sourceFilters.brandId);
    }

    if (sourceFilters.sportId) {
      params.sportId = Number(sourceFilters.sportId);
    }

    if (sourceFilters.gender) {
      params.gender = sourceFilters.gender;
    }

    if (sourceFilters.isActive !== "") {
      params.isActive = sourceFilters.isActive === "true";
    }

    return params;
  };

  const fetchProducts = async (sourceFilters = filters) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminProductsApi(buildProductParams(sourceFilters));
      setProducts(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      setLoadingFilterOptions(true);

      const [categoryRes, brandRes, sportRes] = await Promise.all([
        getAdminCategoriesApi(),
        getAdminBrandsApi(),
        getAdminSportsApi(),
      ]);

      setCategories(categoryRes.data || []);
      setBrands(brandRes.data || []);
      setSports(sportRes.data || []);
    } catch (error) {
      console.error("Không thể tải dữ liệu bộ lọc sản phẩm", error);
    } finally {
      setLoadingFilterOptions(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleManageVariants = (product) => {
    setVariantProduct(product);
  };

  const handleManageImages = (product) => {
    setImageProduct(product);
  };

  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await getAdminProductDetailApi(id);
      setEditingProduct(response.data);
      setShowForm(true);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết sản phẩm";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminProductApi(id);
      setSuccessMessage("Xóa sản phẩm thành công");

      fetchProducts(filters);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa sản phẩm";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingProduct) {
        await updateAdminProductApi(editingProduct.id, formData);
        setSuccessMessage("Cập nhật sản phẩm thành công");
      } else {
        await createAdminProductApi(formData);
        setSuccessMessage("Tạo sản phẩm thành công");
      }

      setShowForm(false);
      setEditingProduct(null);
      fetchProducts(filters);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản lý sản phẩm</h1>
            <p className="mt-2 text-slate-500">
              Tìm kiếm và lọc sản phẩm nhanh theo danh mục, thương hiệu, môn,
              giới tính và trạng thái
            </p>
          </div>

          <button
            onClick={handleCreateClick}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Thêm sản phẩm
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_220px]">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Từ khóa
              </label>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Tìm theo tên, slug, mô tả, chất liệu, danh mục, thương hiệu..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sắp xếp
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                disabled={loadingFilterOptions}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
                value={filters.brandId}
                onChange={handleFilterChange}
                disabled={loadingFilterOptions}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
                value={filters.sportId}
                onChange={handleFilterChange}
                disabled={loadingFilterOptions}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">Tất cả môn</option>
                {sports.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Giới tính
              </label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {genderOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Trạng thái
              </label>
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>
                Kết quả:{" "}
                <span className="font-semibold text-slate-800">{products.length}</span>
              </span>
              <span>•</span>
              <span>
                Bộ lọc đang dùng:{" "}
                <span className="font-semibold text-slate-800">
                  {activeFilterCount}
                </span>
              </span>
              {loadingFilterOptions ? <span>• Đang tải bộ lọc...</span> : null}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-green-100 p-4 text-green-700 shadow">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            {editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
          </h2>

          <AdminProductForm
            initialData={editingProduct}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6 text-slate-500">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-slate-500">
            Không có sản phẩm nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Thương hiệu</th>
                  <th className="px-4 py-3">Môn</th>
                  <th className="px-4 py-3">Giới tính</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      #{product.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex min-w-[260px] items-center gap-3">
                        {product.thumbnailUrl ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                            No Image
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{product.categoryName}</td>
                    <td className="px-4 py-3">{product.brandName}</td>
                    <td className="px-4 py-3">{product.sportName}</td>
                    <td className="px-4 py-3">
                      {genderLabelMap[product.gender] || product.gender}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.isActive ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditClick(product.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => handleManageVariants(product)}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Variants
                        </button>

                        <button
                          onClick={() => handleManageImages(product)}
                          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Images
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminProductVariantManager
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
      />

      <AdminProductImageManager
        product={imageProduct}
        onClose={() => setImageProduct(null)}
      />
    </div>
  );
};

export default ManageProductsPage;