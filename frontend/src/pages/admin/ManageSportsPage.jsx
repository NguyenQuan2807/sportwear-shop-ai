import { useEffect, useState } from "react";
import {
  createAdminSportApi,
  deleteAdminSportApi,
  getAdminSportDetailApi,
  getAdminSportsApi,
  updateAdminSportApi,
} from "../../services/adminSportService";
import AdminSportForm from "../../components/common/AdminSportForm";

const ManageSportsPage = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);

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
      fetchSports();
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý môn thể thao</h1>
          <p className="mt-2 text-slate-500">Thêm, sửa, xóa môn thể thao</p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Thêm môn thể thao
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
            {editingSport ? "Cập nhật môn thể thao" : "Tạo môn thể thao mới"}
          </h2>

          <AdminSportForm
            initialData={editingSport}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6">Đang tải danh sách môn thể thao...</div>
        ) : sports.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có môn thể thao nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Mô tả</th>
                  <th className="px-4 py-3 text-left">Icon URL</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {sports.map((sport) => (
                  <tr key={sport.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{sport.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sport.name}</td>
                    <td className="px-4 py-3">{sport.slug}</td>
                    <td className="px-4 py-3 text-slate-600">{sport.description || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {sport.iconUrl ? (
                        <a
                          href={sport.iconUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Xem icon
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          sport.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {sport.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(sport.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
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