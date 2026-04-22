import { useEffect, useMemo, useState } from "react";
import {
  createAdminPromotionApi,
  deleteAdminPromotionApi,
  getAdminPromotionDetailApi,
  getAdminPromotionsApi,
  updateAdminPromotionApi,
} from "../../services/adminPromotionService";
import AdminPromotionForm from "../../components/common/AdminPromotionForm";
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

const toneByStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SCHEDULED":
      return "info";
    case "EXPIRED":
      return "warning";
    case "DISABLED":
      return "danger";
    default:
      return "neutral";
  }
};

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
      setErrorMessage(error?.response?.data?.message || "Không thể tải danh sách promotion");
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
      [promotion.id, promotion.name, promotion.slug, promotion.promotionType, promotion.discountType, promotion.discountValue, promotion.priority, promotion.status, promotion.startTime, promotion.endTime, `${promotion.targets?.length || 0}`].some((value) =>
        normalizeText(value).includes(keyword)
      )
    );
  }, [promotions, searchTerm]);

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter((item) => item.status === "ACTIVE").length;
  const scheduledPromotions = promotions.filter((item) => item.status === "SCHEDULED").length;
  const expiredPromotions = promotions.filter((item) => item.status === "EXPIRED").length;

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
      setErrorMessage(error?.response?.data?.message || "Không thể tải chi tiết promotion");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa chương trình này?")) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminPromotionApi(id);
      setSuccessMessage("Xóa promotion thành công");
      fetchPromotions();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa promotion");
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
      setErrorMessage(error?.response?.data?.message || "Không thể lưu promotion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý chương trình khuyến mãi"
        description="Đồng bộ trang promotion với layout mới để dễ theo dõi trạng thái, loại và target áp dụng."
        breadcrumbs={["Admin", "Khuyến mãi"]}
        action={<AdminButton variant="brand" onClick={handleCreateClick}>Thêm chương trình</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Tổng chương trình" value={totalPromotions} helper="Tất cả promotion hiện có" tone="brand" icon={<SparklesIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang hoạt động" value={activePromotions} helper="Promotion đang áp dụng" tone="emerald" icon={<CheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đã lên lịch" value={scheduledPromotions} helper="Promotion chờ kích hoạt" tone="violet" icon={<CalendarIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đã hết hạn" value={expiredPromotions} helper="Promotion cần rà soát lại" tone="amber" icon={<ClockIcon className="h-5 w-5" />} />
      </div>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      <AdminCard title="Bộ lọc chương trình" description="Tìm theo tên, slug, trạng thái, loại hoặc giá trị giảm giá.">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <AdminFilterLabel>Tìm kiếm</AdminFilterLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên, slug, trạng thái, loại, discount..."
              className={adminInputClassName}
            />
          </div>
          <div className="flex items-end">
            <AdminButton variant="light" className="w-full" onClick={() => setSearchTerm("")}>Xóa bộ lọc</AdminButton>
          </div>
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingPromotion ? "Cập nhật chương trình" : "Tạo chương trình mới"} description="Form promotion hiện tại được bọc trong card mới để đồng bộ toàn bộ admin.">
          <AdminPromotionForm
            initialData={editingPromotion}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingPromotion(null);
            }}
          />
        </AdminCard>
      ) : null}

      <AdminCard title="Danh sách chương trình khuyến mãi" description={`Hiển thị ${filteredPromotions.length} kết quả phù hợp.`}>
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách promotion...</div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-sm text-slate-500">{searchTerm ? "Không tìm thấy promotion phù hợp." : "Chưa có promotion nào."}</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Tên</th>
                    <th className="px-5 py-4 font-semibold">Loại</th>
                    <th className="px-5 py-4 font-semibold">Giảm giá</th>
                    <th className="px-5 py-4 font-semibold">Priority</th>
                    <th className="px-5 py-4 font-semibold">Thời gian</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Targets</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-500">#{promotion.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{promotion.name}</p>
                        <p className="text-xs text-slate-400">{promotion.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <div>{promotion.promotionType}</div>
                        <div className="text-xs text-slate-400">{promotion.discountType}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{promotion.discountValue}</td>
                      <td className="px-5 py-4 text-slate-500">{promotion.priority}</td>
                      <td className="px-5 py-4 text-slate-500">
                        <div>{promotion.startTime?.replace("T", " ") || "-"}</div>
                        <div>{promotion.endTime?.replace("T", " ") || "-"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(toneByStatus(promotion.status))}>{promotion.status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{promotion.targets?.length || 0} target</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <AdminButton variant="warning" className="px-4 py-2 text-xs" onClick={() => handleEditClick(promotion.id)}>Sửa</AdminButton>
                          <AdminButton variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(promotion.id)}>Xóa</AdminButton>
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
function SparklesIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Zm7 11 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1 1-2.6ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" strokeLinejoin="round" /></svg>;
}
function CheckIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CalendarIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ClockIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default ManagePromotionsPage;
