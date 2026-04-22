import { useEffect, useMemo, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  AdminAlert,
  AdminButton,
  AdminFilterLabel,
  adminInputClassName,
} from "../admin/AdminShell";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  isActive: true,
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const checkboxClassName = "h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500";
const fileInputClassName = `${adminInputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200`;

const AdminBrandForm = ({ initialData = null, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        logoUrl: initialData.logoUrl || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setLogoPreview(initialData.logoUrl ? resolveImageUrl(initialData.logoUrl) : "");
    } else {
      setFormData(defaultForm);
      setLogoPreview("");
    }

    setLogoFile(null);
    setFormError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name" && !isEditing && !prev.slug.trim()) {
        nextData.slug = slugify(value);
      }

      return nextData;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    try {
      if (logoFile) {
        setUploadingImage(true);
        const uploadRes = await uploadAdminImageApi(logoFile, "brands");
        payload.logoUrl = uploadRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      setFormError(error?.response?.data?.message || "Không thể upload logo thương hiệu");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <AdminAlert type="error">{formError}</AdminAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Tên thương hiệu</AdminFilterLabel>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={adminInputClassName}
                placeholder="Ví dụ: Nike"
                required
              />
            </div>

            <div>
              <AdminFilterLabel>Slug</AdminFilterLabel>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={adminInputClassName}
                placeholder="nike"
                required
              />
            </div>
          </div>

          <div>
            <AdminFilterLabel>Mô tả</AdminFilterLabel>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={adminInputClassName}
              placeholder="Giới thiệu nhanh để admin dễ nhận diện thương hiệu..."
            />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className={checkboxClassName}
              />
              <span>
                <span className="block font-semibold text-slate-900">Kích hoạt thương hiệu</span>
                <span className="mt-1 block">Tắt trạng thái này nếu bạn muốn ẩn brand khỏi storefront.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <AdminFilterLabel>Logo thương hiệu</AdminFilterLabel>
            <input type="file" accept="image/*" onChange={handleLogoChange} className={fileInputClassName} />
            <p className="mt-2 text-xs leading-5 text-slate-500">Ưu tiên logo vuông, nền trong hoặc nền sáng để hiển thị đẹp trong admin và storefront.</p>
          </div>

          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Xem trước logo</p>
            {logoPreview ? (
              <div className="space-y-4">
                <img src={logoPreview} alt="brand logo preview" className="h-32 w-32 rounded-2xl border border-slate-200 object-cover" />
                <AdminButton type="button" variant="danger" className="w-full" onClick={clearLogo}>Xóa logo</AdminButton>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">Chưa có logo</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting || uploadingImage}>
          {uploadingImage ? "Đang upload logo..." : submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo thương hiệu"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminBrandForm;
