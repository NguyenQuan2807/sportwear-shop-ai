import { useEffect, useMemo, useState } from "react";
import {
  createAdminBrandApi,
  deleteAdminBrandApi,
  getAdminBrandDetailApi,
  getAdminBrandsApi,
  updateAdminBrandApi,
} from "../../services/adminBrandService";
import AdminBrandForm from "../../components/common/AdminBrandForm";
import AdminTableToolbar from "../../components/common/AdminTableToolbar";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const ManageBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredBrands = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return brands;

    return brands.filter((brand) =>
      [
        brand.id,
        brand.name,
        brand.slug,
        brand.description,
        brand.isActive ? "hoạt động" : "ẩn",
      ].some((value) => normalizeText(value).includes(keyword))
    );
  }, [brands, searchTerm]);

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
      <AdminTableToolbar
        title="Quản lý thương hiệu"
        description="Thêm, sửa, xóa thương hiệu sản phẩm"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm theo tên, slug, mô tả, trạng thái..."
        createLabel="Thêm thương hiệu"
        onCreateClick={handleCreateClick}
        resultCount={filteredBrands.length}
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
          <div className="p-6 text-slate-500">Đang tải danh sách thương hiệu...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-6 text-slate-500">
            {searchTerm
              ? "Không tìm thấy thương hiệu phù hợp."
              : "Chưa có thương hiệu nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredBrands.map((brand) => (
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
                        <span className="text-slate-400">No Image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3">{brand.slug}</td>
                    <td className="px-4 py-3">{brand.description || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          brand.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {brand.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
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