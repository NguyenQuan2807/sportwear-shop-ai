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
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminFilterLabel,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

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

const PAGE_SIZE = 10;

const iconButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition hover:-translate-y-0.5";
const actionIconButtonClassName = {
  edit: `${iconButtonBase} border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700`,
  variant: `${iconButtonBase} border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700`,
  image: `${iconButtonBase} border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700`,
  delete: `${iconButtonBase} border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700`,
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
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "sort" && value !== "",
    ).length;
  }, [filters]);

  const buildProductParams = (sourceFilters) => {
    const params = {
      sort: sourceFilters.sort || "newest",
    };

    if (sourceFilters.keyword?.trim())
      params.keyword = sourceFilters.keyword.trim();
    if (sourceFilters.categoryId)
      params.categoryId = Number(sourceFilters.categoryId);
    if (sourceFilters.brandId) params.brandId = Number(sourceFilters.brandId);
    if (sourceFilters.sportId) params.sportId = Number(sourceFilters.sportId);
    if (sourceFilters.gender) params.gender = sourceFilters.gender;
    if (sourceFilters.isActive !== "")
      params.isActive = sourceFilters.isActive === "true";

    return params;
  };

  const fetchProducts = async (sourceFilters = filters) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminProductsApi(
        buildProductParams(sourceFilters),
      );
      setProducts(response.data || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tải danh sách sản phẩm",
      );
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
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchProducts(filters);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
      setErrorMessage(
        error?.response?.data?.message || "Không thể tải chi tiết sản phẩm",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminProductApi(id);
      setSuccessMessage("Xóa sản phẩm thành công");
      fetchProducts(filters);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể xóa sản phẩm",
      );
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
      setErrorMessage(
        error?.response?.data?.message || "Không thể lưu sản phẩm",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const startItem =
    products.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, products.length);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        breadcrumbs={["Admin", "Catalog", "Sản phẩm"]}
        action={
          <AdminButton variant="brand" onClick={handleCreateClick}>
            Thêm sản phẩm
          </AdminButton>
        }
      />

      {successMessage ? (
        <AdminAlert type="success">{successMessage}</AdminAlert>
      ) : null}
      {errorMessage ? (
        <AdminAlert type="error">{errorMessage}</AdminAlert>
      ) : null}

      {showForm ? (
        <AdminCard
          title={editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
        >
          <AdminProductForm
            initialData={editingProduct}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </AdminCard>
      ) : null}

      <AdminCard>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  className={`${adminInputClassName} pl-12`}
                />
              </div>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className={adminInputClassName}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FilterIcon className="h-4 w-4" />
                Bộ lọc
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              {activeFilterCount > 0 ? (
                <AdminButton
                  variant="light"
                  className="px-4 py-3"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Xóa lọc
                </AdminButton>
              ) : null}
            </div>
          </div>

          {showFilters ? (
            <div className="grid grid-cols-1 gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <AdminFilterLabel>Danh mục</AdminFilterLabel>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  disabled={loadingFilterOptions}
                  className={adminInputClassName}
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
                <AdminFilterLabel>Thương hiệu</AdminFilterLabel>
                <select
                  name="brandId"
                  value={filters.brandId}
                  onChange={handleFilterChange}
                  disabled={loadingFilterOptions}
                  className={adminInputClassName}
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
                <AdminFilterLabel>Môn thể thao</AdminFilterLabel>
                <select
                  name="sportId"
                  value={filters.sportId}
                  onChange={handleFilterChange}
                  disabled={loadingFilterOptions}
                  className={adminInputClassName}
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
                <AdminFilterLabel>Giới tính</AdminFilterLabel>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className={adminInputClassName}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <AdminFilterLabel>Trạng thái</AdminFilterLabel>
                <select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className={adminInputClassName}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="text-sm text-slate-500">
              Đang tải danh sách sản phẩm...
            </div>
          ) : products.length === 0 ? (
            <div className="text-sm text-slate-500">
              Không có sản phẩm nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            <>
              <AdminTableShell>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <thead className="border-b border-slate-200 bg-white text-left text-slate-500">
                      <tr>
                        <th className="w-[28%] px-4 py-3 font-semibold">
                          Sản phẩm
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Danh mục
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Thương hiệu
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Môn thể thao
                        </th>
                        <th className="w-[10%] px-4 py-3 font-semibold">
                          Giới tính
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Trạng thái
                        </th>
                        <th className="w-[14%] px-4 py-3 text-right font-semibold">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {product.thumbnailUrl ? (
                                <img
                                  src={resolveImageUrl(product.thumbnailUrl)}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400 ring-1 ring-slate-200">
                                  No image
                                </div>
                              )}
                              <div className="min-w-0">
                                <p
                                  className="block max-w-full truncate font-semibold text-slate-900"
                                  title={product.name}
                                >
                                  {product.name}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span>#{product.id}</span>
                                  <span>•</span>
                                  <span
                                    className="block max-w-full truncate"
                                    title={product.slug}
                                  >
                                    {product.slug}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {product.categoryName || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {product.brandName || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {product.sportName || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {genderLabelMap[product.gender] ||
                              product.gender ||
                              "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={statusPillClassName(
                                product.isActive ? "success" : "danger",
                              )}
                            >
                              {product.isActive ? "Đang bán" : "Ngừng bán"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                title="Sửa sản phẩm"
                                className={actionIconButtonClassName.edit}
                                onClick={() => handleEditClick(product.id)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Quản lý biến thể"
                                className={actionIconButtonClassName.variant}
                                onClick={() => setVariantProduct(product)}
                              >
                                <LayersIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Quản lý ảnh"
                                className={actionIconButtonClassName.image}
                                onClick={() => setImageProduct(product)}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Xóa sản phẩm"
                                className={actionIconButtonClassName.delete}
                                onClick={() => handleDelete(product.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminTableShell>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <span>
                  Hiển thị {startItem}-{endItem} trên {products.length} sản phẩm
                </span>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                        currentPage === page
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminCard>

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

function iconProps(className) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    className,
  };
}
function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function FilterIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m12 6 4 4" strokeLinecap="round" />
    </svg>
  );
}
function LayersIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <path
        d="m12 4 8 4-8 4-8-4 8-4ZM4 12l8 4 8-4M4 16l8 4 8-4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ImageIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m20 16-4.5-4.5L8 19" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
      <path d="M6 7l1 12h10l1-12M9 7V4h6v3" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronLeftIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default ManageProductsPage;
