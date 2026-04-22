import { useEffect, useMemo, useState } from "react";
import {
  createAdminCategoryApi,
  deleteAdminCategoryApi,
  getAdminCategoriesApi,
  getAdminCategoryDetailApi,
  updateAdminCategoryApi,
} from "../../services/adminCategoryService";
import AdminCategoryForm from "../../components/common/AdminCategoryForm";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminFilterLabel,
  AdminMetricCard,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminCategoriesApi();
      setCategories(response.data || []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return categories;

    return categories.filter((category) =>
      [category.id, category.name, category.slug, category.description, category.isActive ? "hoạt động" : "ẩn"].some((value) =>
        normalizeText(value).includes(keyword)
      )
    );
  }, [categories, searchTerm]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((item) => item.isActive).length;
  const inactiveCategories = totalCategories - activeCategories;

  const handleCreateClick = () => {
    setEditingCategory(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await getAdminCategoryDetailApi(id);
      setEditingCategory(response.data);
      setShowForm(true);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể tải chi tiết danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminCategoryApi(id);
      setSuccessMessage("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingCategory) {
        await updateAdminCategoryApi(editingCategory.id, formData);
        setSuccessMessage("Cập nhật danh mục thành công");
      } else {
        await createAdminCategoryApi(formData);
        setSuccessMessage("Tạo danh mục thành công");
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Đồng bộ lại giao diện quản trị danh mục theo bộ khung admin mới, vẫn giữ nguyên form và API hiện tại."
        breadcrumbs={["Admin", "Danh mục"]}
        action={<AdminButton variant="brand" onClick={handleCreateClick}>Thêm danh mục</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Tổng danh mục" value={totalCategories} helper="Tất cả danh mục trong hệ thống" tone="brand" icon={<LayersIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang hoạt động" value={activeCategories} helper="Danh mục đang hiển thị cho shop" tone="emerald" icon={<CheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang ẩn" value={inactiveCategories} helper="Danh mục đang tạm ẩn" tone="amber" icon={<EyeOffIcon className="h-5 w-5" />} />
      </div>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      <AdminCard title="Bộ lọc danh mục" description="Tìm kiếm theo tên, slug, mô tả hoặc trạng thái.">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <AdminFilterLabel>Tìm kiếm</AdminFilterLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên, slug, mô tả, trạng thái..."
              className={adminInputClassName}
            />
          </div>
          <div className="flex items-end">
            <AdminButton variant="light" className="w-full" onClick={() => setSearchTerm("")}>Xóa bộ lọc</AdminButton>
          </div>
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingCategory ? "Cập nhật danh mục" : "Tạo danh mục mới"} description="Sử dụng form hiện tại của hệ thống nhưng hiển thị trong card mới.">
          <AdminCategoryForm
            initialData={editingCategory}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </AdminCard>
      ) : null}

      <AdminCard title="Danh sách danh mục" description={`Hiển thị ${filteredCategories.length} kết quả phù hợp.`}>
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách danh mục...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-sm text-slate-500">{searchTerm ? "Không tìm thấy danh mục phù hợp." : "Chưa có danh mục nào."}</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Tên</th>
                    <th className="px-5 py-4 font-semibold">Slug</th>
                    <th className="px-5 py-4 font-semibold">Mô tả</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-500">#{category.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{category.name}</td>
                      <td className="px-5 py-4 text-slate-500">{category.slug}</td>
                      <td className="px-5 py-4 text-slate-500">{category.description || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(category.isActive ? "success" : "neutral")}>{category.isActive ? "Hoạt động" : "Ẩn"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <AdminButton variant="warning" className="px-4 py-2 text-xs" onClick={() => handleEditClick(category.id)}>Sửa</AdminButton>
                          <AdminButton variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(category.id)}>Xóa</AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableShell>
        )}
      </AdminCard>
    </div>
  );
};

function iconProps(className) {
  return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", className };
}
function LayersIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" strokeLinejoin="round" /></svg>;
}
function CheckIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EyeOffIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m3 3 18 18" strokeLinecap="round" /><path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" /><path d="M9.88 5.09A9.77 9.77 0 0 1 12 4.8c4.7 0 8.6 3.11 9.8 7.2a10.76 10.76 0 0 1-4.04 5.3" /><path d="M6.61 6.61A10.75 10.75 0 0 0 2.2 12c.82 2.82 2.93 5.08 5.67 6.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default ManageCategoriesPage;
