import { useEffect, useState } from "react";
import {
  createAdminBrandApi,
  deleteAdminBrandApi,
  getAdminBrandDetailApi,
  getAdminBrandsApi,
  updateAdminBrandApi,
} from "../../services/adminBrandService";
import AdminBrandForm from "../../components/common/AdminBrandForm";

const ManageBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminBrandsApi();
      setBrands(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách thương hiệu";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateClick = () => {
    setEditingBrand(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await getAdminBrandDetailApi(id);
      setEditingBrand(response.data);
      setShowForm(true);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết thương hiệu";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa thương hiệu này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminBrandApi(id);
      setSuccessMessage("Xóa thương hiệu thành công");
      fetchBrands();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa thương hiệu";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingBrand) {
        await updateAdminBrandApi(editingBrand.id, formData);
        setSuccessMessage("Cập nhật thương hiệu thành công");
      } else {
        await createAdminBrandApi(formData);
        setSuccessMessage("Tạo thương hiệu thành công");
      }

      setShowForm(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu thương hiệu";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý thương hiệu
          </h1>
          <p className="mt-2 text-slate-500">
            Thêm, sửa, xóa thương hiệu sản phẩm
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Thêm thương hiệu
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
            {editingBrand ? "Cập nhật thương hiệu" : "Tạo thương hiệu mới"}
          </h2>

          <AdminBrandForm
            initialData={editingBrand}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6">Đang tải danh sách thương hiệu...</div>
        ) : brands.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có thương hiệu nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Logo</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Mô tả</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{brand.id}</td>
                    <td className="px-4 py-3">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3">{brand.slug}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {brand.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          brand.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {brand.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(brand.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
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

export default ManageBrandsPage;