import { useEffect, useState } from "react";
import {
  createAdminCategoryApi,
  deleteAdminCategoryApi,
  getAdminCategoriesApi,
  getAdminCategoryDetailApi,
  updateAdminCategoryApi,
} from "../../services/adminCategoryService";
import AdminCategoryForm from "../../components/common/AdminCategoryForm";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý danh mục
          </h1>
          <p className="mt-2 text-slate-500">
            Thêm, sửa, xóa danh mục sản phẩm
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Thêm danh mục
        </button>
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
          <div className="p-6">Đang tải danh sách danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có danh mục nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Mô tả</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{category.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">{category.slug}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {category.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {category.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
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