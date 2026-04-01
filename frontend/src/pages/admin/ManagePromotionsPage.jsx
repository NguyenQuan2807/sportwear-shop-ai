import { useEffect, useMemo, useState } from "react";
import {
  createAdminPromotionApi,
  deleteAdminPromotionApi,
  getAdminPromotionDetailApi,
  getAdminPromotionsApi,
  updateAdminPromotionApi,
} from "../../services/adminPromotionService";
import AdminPromotionForm from "../../components/common/AdminPromotionForm";
import AdminTableToolbar from "../../components/common/AdminTableToolbar";

const STATUS_BADGE = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  DISABLED: "bg-red-100 text-red-700",
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const ManagePromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredPromotions = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return promotions;

    return promotions.filter((promotion) =>
      [
        promotion.id,
        promotion.name,
        promotion.slug,
        promotion.promotionType,
        promotion.discountType,
        promotion.discountValue,
        promotion.priority,
        promotion.status,
        promotion.startTime,
        promotion.endTime,
        `${promotion.targets?.length || 0}`,
      ].some((value) => normalizeText(value).includes(keyword))
    );
  }, [promotions, searchTerm]);

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
      <AdminTableToolbar
        title="Quản lý chương trình khuyến mãi"
        description="Tạo flash sale, chương trình giảm giá và target áp dụng"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm theo tên, slug, trạng thái, loại, discount..."
        createLabel="Thêm chương trình"
        onCreateClick={handleCreateClick}
        resultCount={filteredPromotions.length}
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
          <div className="p-6 text-slate-500">Đang tải danh sách promotion...</div>
        ) : filteredPromotions.length === 0 ? (
          <div className="p-6 text-slate-500">
            {searchTerm ? "Không tìm thấy promotion phù hợp." : "Chưa có promotion nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Giảm giá</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Targets</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{promotion.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{promotion.name}</p>
                      <p className="text-xs text-slate-500">{promotion.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>{promotion.promotionType}</div>
                      <div className="text-xs text-slate-500">{promotion.discountType}</div>
                    </td>
                    <td className="px-4 py-3">{promotion.discountValue}</td>
                    <td className="px-4 py-3">{promotion.priority}</td>
                    <td className="px-4 py-3">
                      <div>{promotion.startTime?.replace("T", " ")}</div>
                      <div>{promotion.endTime?.replace("T", " ")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_BADGE[promotion.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {promotion.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{promotion.targets?.length || 0} target</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
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