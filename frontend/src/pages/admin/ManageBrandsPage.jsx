import { useEffect, useMemo, useState } from "react";
import {
  createAdminBrandApi,
  deleteAdminBrandApi,
  getAdminBrandDetailApi,
  getAdminBrandsApi,
  updateAdminBrandApi,
} from "../../services/adminBrandService";
import AdminBrandForm from "../../components/common/AdminBrandForm";
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
      setErrorMessage(error?.response?.data?.message || "Không thể tải danh sách thương hiệu");
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
      [brand.id, brand.name, brand.slug, brand.description, brand.isActive ? "hoạt động" : "ẩn"].some((value) =>
        normalizeText(value).includes(keyword)
      )
    );
  }, [brands, searchTerm]);

  const totalBrands = brands.length;
  const activeBrands = brands.filter((item) => item.isActive).length;
  const withLogo = brands.filter((item) => Boolean(item.logoUrl)).length;

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
      setErrorMessage(error?.response?.data?.message || "Không thể tải chi tiết thương hiệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminBrandApi(id);
      setSuccessMessage("Xóa thương hiệu thành công");
      fetchBrands();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa thương hiệu");
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
      setErrorMessage(error?.response?.data?.message || "Không thể lưu thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý thương hiệu"
        description="Đồng bộ giao diện quản trị thương hiệu theo hệ thống card, filter và bảng dữ liệu mới."
        breadcrumbs={["Admin", "Thương hiệu"]}
        action={<AdminButton variant="brand" onClick={handleCreateClick}>Thêm thương hiệu</AdminButton>}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Tổng thương hiệu" value={totalBrands} helper="Số lượng brand đang quản lý" tone="brand" icon={<TagIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đang hoạt động" value={activeBrands} helper="Brand đang hiển thị" tone="emerald" icon={<CheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Có logo" value={withLogo} helper="Brand đã có ảnh logo" tone="violet" icon={<ImageIcon className="h-5 w-5" />} />
      </div>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      <AdminCard title="Bộ lọc thương hiệu" description="Tìm nhanh theo tên, slug hoặc trạng thái.">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <AdminFilterLabel>Tìm kiếm</AdminFilterLabel>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên, slug, mô tả, trạng thái..."
              className={adminInputClassName}
            />
          </div>
          <div className="flex items-end">
            <AdminButton variant="light" className="w-full" onClick={() => setSearchTerm("")}>Xóa bộ lọc</AdminButton>
          </div>
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingBrand ? "Cập nhật thương hiệu" : "Tạo thương hiệu mới"} description="Giữ nguyên form upload/logo hiện tại nhưng hiển thị trong card mới.">
          <AdminBrandForm
            initialData={editingBrand}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingBrand(null);
            }}
          />
        </AdminCard>
      ) : null}

      <AdminCard title="Danh sách thương hiệu" description={`Hiển thị ${filteredBrands.length} kết quả phù hợp.`}>
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách thương hiệu...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-sm text-slate-500">{searchTerm ? "Không tìm thấy thương hiệu phù hợp." : "Chưa có thương hiệu nào."}</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Logo</th>
                    <th className="px-5 py-4 font-semibold">Tên</th>
                    <th className="px-5 py-4 font-semibold">Slug</th>
                    <th className="px-5 py-4 font-semibold">Mô tả</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-500">#{brand.id}</td>
                      <td className="px-5 py-4">
                        {brand.logoUrl ? (
                          <img src={resolveImageUrl(brand.logoUrl)} alt={brand.name} className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">No logo</div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{brand.name}</td>
                      <td className="px-5 py-4 text-slate-500">{brand.slug}</td>
                      <td className="px-5 py-4 text-slate-500">{brand.description || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(brand.isActive ? "success" : "neutral")}>{brand.isActive ? "Hoạt động" : "Ẩn"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <AdminButton variant="warning" className="px-4 py-2 text-xs" onClick={() => handleEditClick(brand.id)}>Sửa</AdminButton>
                          <AdminButton variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(brand.id)}>Xóa</AdminButton>
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
function TagIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="M20 10.59V5a1 1 0 0 0-1-1h-5.59a1 1 0 0 0-.7.29l-8.42 8.42a1 1 0 0 0 0 1.41l5.59 5.59a1 1 0 0 0 1.41 0l8.42-8.42a1 1 0 0 0 .29-.7Z" /><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" /></svg>;
}
function CheckIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ImageIcon({ className = "h-5 w-5" }) {
  return <svg {...iconProps(className)}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.2" /><path d="m21 15-4.5-4.5-5 5L9 13l-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default ManageBrandsPage;
