import { useEffect, useState } from "react";
import {
  createAdminPromotionApi,
  deleteAdminPromotionApi,
  getAdminPromotionDetailApi,
  getAdminPromotionsApi,
  updateAdminPromotionApi,
} from "../../services/adminPromotionService";
import AdminPromotionForm from "../../components/common/AdminPromotionForm";

const STATUS_BADGE = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  DISABLED: "bg-red-100 text-red-700",
};

const ManagePromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminPromotionsApi();
      setPromotions(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách promotion";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreateClick = () => {
    setEditingPromotion(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await getAdminPromotionDetailApi(id);
      setEditingPromotion(response.data);
      setShowForm(true);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết promotion";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa chương trình này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminPromotionApi(id);
      setSuccessMessage("Xóa promotion thành công");
      fetchPromotions();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa promotion";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingPromotion) {
        await updateAdminPromotionApi(editingPromotion.id, formData);
        setSuccessMessage("Cập nhật promotion thành công");
      } else {
        await createAdminPromotionApi(formData);
        setSuccessMessage("Tạo promotion thành công");
      }

      setShowForm(false);
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu promotion";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPromotion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý chương trình khuyến mãi
          </h1>
          <p className="mt-2 text-slate-500">
            Tạo flash sale, chương trình giảm giá và target áp dụng
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Thêm chương trình
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
            {editingPromotion ? "Cập nhật chương trình" : "Tạo chương trình mới"}
          </h2>

          <AdminPromotionForm
            initialData={editingPromotion}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6">Đang tải danh sách promotion...</div>
        ) : promotions.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có promotion nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Giảm giá</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Targets</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{promotion.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{promotion.name}</div>
                      <div className="text-xs text-slate-500">{promotion.slug}</div>
                    </td>
                    <td className="px-4 py-3">{promotion.promotionType}</td>
                    <td className="px-4 py-3">
                      <div>{promotion.discountType}</div>
                      <div className="text-xs text-slate-500">
                        {promotion.discountValue}
                      </div>
                    </td>
                    <td className="px-4 py-3">{promotion.priority}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{promotion.startTime?.replace("T", " ")}</div>
                      <div>{promotion.endTime?.replace("T", " ")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_BADGE[promotion.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {promotion.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {promotion.targets?.length || 0} target
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(promotion.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id)}
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

export default ManagePromotionsPage;