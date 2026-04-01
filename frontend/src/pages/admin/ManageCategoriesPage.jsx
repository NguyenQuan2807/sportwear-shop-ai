import { useEffect, useMemo, useState } from "react";
import {
  createAdminCategoryApi,
  deleteAdminCategoryApi,
  getAdminCategoriesApi,
  getAdminCategoryDetailApi,
  updateAdminCategoryApi,
} from "../../services/adminCategoryService";
import AdminCategoryForm from "../../components/common/AdminCategoryForm";
import AdminTableToolbar from "../../components/common/AdminTableToolbar";

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
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách danh mục";
      setErrorMessage(backendMessage);
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
      [
        category.id,
        category.name,
        category.slug,
        category.description,
        category.isActive ? "hoạt động" : "ẩn",
      ].some((value) => normalizeText(value).includes(keyword))
    );
  }, [categories, searchTerm]);

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
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết danh mục";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminCategoryApi(id);
      setSuccessMessage("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa danh mục";
      setErrorMessage(backendMessage);
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
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu danh mục";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <AdminTableToolbar
        title="Quản lý danh mục"
        description="Thêm, sửa, xóa danh mục sản phẩm"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm theo tên, slug, mô tả, trạng thái..."
        createLabel="Thêm danh mục"
        onCreateClick={handleCreateClick}
        resultCount={filteredCategories.length}
      />

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
            {editingCategory ? "Cập nhật danh mục" : "Tạo danh mục mới"}
          </h2>

          <AdminCategoryForm
            initialData={editingCategory}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6 text-slate-500">Đang tải danh sách danh mục...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-6 text-slate-500">
            {searchTerm ? "Không tìm thấy danh mục phù hợp." : "Chưa có danh mục nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{category.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">{category.slug}</td>
                    <td className="px-4 py-3">{category.description || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {category.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditClick(category.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
    </div>
  );
};

export default ManageCategoriesPage;