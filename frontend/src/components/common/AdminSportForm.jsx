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
  imageUrl: "",
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

const AdminSportForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        isActive: initialData.isActive ?? true,
      });
      setImagePreview(initialData.imageUrl ? resolveImageUrl(initialData.imageUrl) : "");
    } else {
      setFormData(defaultForm);
      setImagePreview("");
    }

    setImageFile(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    let payload = { ...formData };

    try {
      if (imageFile) {
        setUploadingImage(true);
        const uploadImageRes = await uploadAdminImageApi(imageFile, "sports");
        payload.imageUrl = uploadImageRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể upload ảnh môn thể thao";
      setFormError(backendMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <AdminAlert type="error">{formError}</AdminAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Tên môn thể thao</AdminFilterLabel>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={adminInputClassName}
                placeholder="Ví dụ: Bóng đá"
              />
            </div>

            <div>
              <AdminFilterLabel>Slug</AdminFilterLabel>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className={adminInputClassName}
                placeholder="bong-da"
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
              placeholder="Mô tả ngắn để admin và khách hàng dễ hiểu hơn về nhóm sport này..."
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
                <span className="block font-semibold text-slate-900">Kích hoạt sport</span>
                <span className="mt-1 block">Ảnh này sẽ được dùng cho card “Mua sắm theo môn thể thao” ngoài storefront.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <AdminFilterLabel>Ảnh môn thể thao</AdminFilterLabel>
            <input type="file" accept="image/*" onChange={handleImageChange} className={fileInputClassName} />
            <p className="mt-2 text-xs leading-5 text-slate-500">Nên dùng ảnh ngang đẹp, chất lượng tốt, phù hợp card homepage.</p>
          </div>

          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Xem trước ảnh</p>
              {imagePreview ? <AdminButton type="button" variant="danger" className="px-3 py-2 text-xs" onClick={clearImage}>Xóa ảnh</AdminButton> : null}
            </div>
            {imagePreview ? (
              <img src={imagePreview} alt="sport preview" className="h-64 w-full rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">Chưa có ảnh xem trước</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting || uploadingImage}>
          {uploadingImage ? "Đang upload ảnh..." : submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo môn thể thao"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminSportForm;
