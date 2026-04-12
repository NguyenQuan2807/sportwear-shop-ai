import { useEffect, useMemo, useState } from "react";
import {
  createAdminSportApi,
  deleteAdminSportApi,
  getAdminSportDetailApi,
  getAdminSportsApi,
  updateAdminSportApi,
} from "../../services/adminSportService";
import AdminSportForm from "../../components/common/AdminSportForm";
import AdminTableToolbar from "../../components/common/AdminTableToolbar";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const ManageSportsPage = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSports = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminSportsApi();
      setSports(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách môn thể thao";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const filteredSports = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return sports;

    return sports.filter((sport) =>
      [
        sport.id,
        sport.name,
        sport.slug,
        sport.description,
        sport.imageUrl,
        sport.productCount,
        sport.isActive ? "hoạt động" : "ẩn",
      ].some((value) => normalizeText(value).includes(keyword))
    );
  }, [sports, searchTerm]);

  const handleCreateClick = () => {
    setEditingSport(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await getAdminSportDetailApi(id);
      setEditingSport(response.data);
      setShowForm(true);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết môn thể thao";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa môn thể thao này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminSportApi(id);
      setSuccessMessage("Xóa môn thể thao thành công");
      fetchSports();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa môn thể thao";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingSport) {
        await updateAdminSportApi(editingSport.id, formData);
        setSuccessMessage("Cập nhật môn thể thao thành công");
      } else {
        await createAdminSportApi(formData);
        setSuccessMessage("Tạo môn thể thao thành công");
      }

      setShowForm(false);
      setEditingSport(null);
      await fetchSports();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu môn thể thao";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSport(null);
  };

  return (
    <div className="space-y-6">
      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <AdminTableToolbar
        title="Quản lý môn thể thao"
        description="Quản lý ảnh môn thể thao và số lượng sản phẩm theo từng môn."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm theo tên, slug, mô tả, ảnh..."
        createLabel="Thêm môn thể thao"
        onCreateClick={handleCreateClick}
        resultCount={filteredSports.length}
      />

      {showForm ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            {editingSport ? "Cập nhật môn thể thao" : "Tạo môn thể thao mới"}
          </h2>
          <AdminSportForm
            initialData={editingSport}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      ) : null}

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">
            Đang tải danh sách môn thể thao...
          </div>
        ) : filteredSports.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            {searchTerm
              ? "Không tìm thấy môn thể thao phù hợp."
              : "Chưa có môn thể thao nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Tên</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Ảnh môn thể thao</th>
                  <th className="px-4 py-3 font-semibold">Số sản phẩm</th>
                  <th className="px-4 py-3 font-semibold">Mô tả</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSports.map((sport) => (
                  <tr key={sport.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-4 text-slate-600">{sport.id}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {sport.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{sport.slug}</td>
                    <td className="px-4 py-4">
                      {sport.imageUrl ? (
                        <div className="space-y-2">
                          <img
                            src={sport.imageUrl}
                            alt={`${sport.name} homepage`}
                            className="h-20 w-32 object-cover ring-1 ring-slate-200"
                          />
                          <a
                            href={sport.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Xem ảnh
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {Number.isFinite(Number(sport.productCount))
                        ? `${sport.productCount} sản phẩm`
                        : "-"}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">
                      {sport.description || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          sport.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {sport.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(sport.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sport.id)}
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

export default ManageSportsPage;
