import { useEffect, useMemo, useState } from "react";
import {
  createAdminSportApi,
  deleteAdminSportApi,
  getAdminSportDetailApi,
  getAdminSportsApi,
  updateAdminSportApi,
} from "../../services/adminSportService";
import AdminSportForm from "../../components/common/AdminSportForm";
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
import { resolveImageUrl } from "../../utils/resolveImageUrl";

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
      setErrorMessage(error?.response?.data?.message || "Không thể tải danh sách môn thể thao");
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
      [sport.id, sport.name, sport.slug, sport.description, sport.imageUrl, sport.productCount, sport.isActive ? "hoạt động" : "ẩn"].some((value) =>
        normalizeText(value).includes(keyword)
      )
    );
  }, [sports, searchTerm]);

  const totalSports = sports.length;
  const activeSports = sports.filter((item) => item.isActive).length;
  const totalProducts = sports.reduce((sum, item) => sum + Number(item.productCount || 0), 0);

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
      setErrorMessage(error?.response?.data?.message || "Không thể tải chi tiết môn thể thao");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn thể thao này?")) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminSportApi(id);
      setSuccessMessage("Xóa môn thể thao thành công");
      fetchSports();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa môn thể thao");
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
      setErrorMessage(error?.response?.data?.message || "Không thể lưu môn thể thao");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý môn thể thao"
        description="Làm mới giao diện quản lý sports để đồng bộ với bộ layout admin mới, đồng thời giữ nguyên form và dữ liệu cũ."
        breadcrumbs={["Admin", "Môn thể thao"]}
        action={<AdminButton variant="brand" onClick={handleCreateClick}>Thêm môn thể thao</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Tổng môn thể thao" value={totalSports} helper="Danh sách sports hiện có" tone="brand" icon={<ActivityIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang hoạt động" value={activeSports} helper="Sports đang hiển thị trên shop" tone="emerald" icon={<CheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Tổng sản phẩm" value={totalProducts} helper="Số sản phẩm gắn với từng sport" tone="violet" icon={<PackageIcon className="h-5 w-5" />} />
      </div>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      <AdminCard title="Bộ lọc môn thể thao" description="Tìm theo tên, slug, mô tả, ảnh hoặc số sản phẩm.">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <AdminFilterLabel>Tìm kiếm</AdminFilterLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên, slug, mô tả, ảnh..."
              className={adminInputClassName}
            />
          </div>
          <div className="flex items-end">
            <AdminButton variant="light" className="w-full" onClick={() => setSearchTerm("")}>Xóa bộ lọc</AdminButton>
          </div>
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingSport ? "Cập nhật môn thể thao" : "Tạo môn thể thao mới"} description="Form hiện tại được đặt trong card mới để admin đồng bộ hơn.">
          <AdminSportForm
            initialData={editingSport}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingSport(null);
            }}
          />
        </AdminCard>
      ) : null}

      <AdminCard title="Danh sách môn thể thao" description={`Hiển thị ${filteredSports.length} kết quả phù hợp.`}>
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách môn thể thao...</div>
        ) : filteredSports.length === 0 ? (
          <div className="text-sm text-slate-500">{searchTerm ? "Không tìm thấy môn thể thao phù hợp." : "Chưa có môn thể thao nào."}</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Tên</th>
                    <th className="px-5 py-4 font-semibold">Slug</th>
                    <th className="px-5 py-4 font-semibold">Ảnh</th>
                    <th className="px-5 py-4 font-semibold">Số sản phẩm</th>
                    <th className="px-5 py-4 font-semibold">Mô tả</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredSports.map((sport) => (
                    <tr key={sport.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-500">#{sport.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{sport.name}</td>
                      <td className="px-5 py-4 text-slate-500">{sport.slug}</td>
                      <td className="px-5 py-4">
                        {sport.imageUrl ? (
                          <div className="space-y-2">
                            <img src={resolveImageUrl(sport.imageUrl)} alt={`${sport.name} homepage`} className="h-20 w-32 rounded-2xl border border-slate-200 object-cover" />
                            <a href={resolveImageUrl(sport.imageUrl)} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">Xem ảnh</a>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{Number.isFinite(Number(sport.productCount)) ? `${sport.productCount} sản phẩm` : "-"}</td>
                      <td className="max-w-xs px-5 py-4 text-slate-500">{sport.description || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(sport.isActive ? "success" : "neutral")}>{sport.isActive ? "Hoạt động" : "Ẩn"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <AdminButton variant="warning" className="px-4 py-2 text-xs" onClick={() => handleEditClick(sport.id)}>Sửa</AdminButton>
                          <AdminButton variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(sport.id)}>Xóa</AdminButton>
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
function ActivityIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="M22 12h-4l-3 7-6-14-3 7H2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CheckIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PackageIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m12 3 8 4.5-8 4.5L4 7.5 12 3Z" /><path d="M4 12.5 12 17l8-4.5" /><path d="M4 17.5 12 22l8-4.5" /></svg>;
}

export default ManageSportsPage;
