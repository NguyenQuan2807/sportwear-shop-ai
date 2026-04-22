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
  imageUrl: "",
  color: "",
  isThumbnail: false,
  sortOrder: 0,
};

const checkboxClassName = "h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500";
const fileInputClassName = `${adminInputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200`;

const AdminProductImageForm = ({ initialData = null, colorOptions = [], onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  const mergedColorOptions = useMemo(() => {
    const set = new Set((colorOptions || []).map((item) => String(item || "").trim()).filter(Boolean));
    const currentColor = String(initialData?.color || "").trim();
    if (currentColor) set.add(currentColor);
    return Array.from(set);
  }, [colorOptions, initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        imageUrl: initialData.imageUrl || "",
        color: initialData.color || "",
        isThumbnail: initialData.isThumbnail || false,
        sortOrder: initialData.sortOrder ?? 0,
      });
      setPreviewUrl(initialData.imageUrl ? resolveImageUrl(initialData.imageUrl) : "");
    } else {
      setFormData(defaultForm);
      setPreviewUrl("");
    }

    setImageFile(null);
    setFormError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "sortOrder" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    let payload = {
      ...formData,
      color: String(formData.color || "").trim() || null,
    };

    try {
      if (imageFile) {
        setUploadingImage(true);
        const uploadRes = await uploadAdminImageApi(imageFile, "products/gallery");
        payload.imageUrl = uploadRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể lưu ảnh sản phẩm";
      setFormError(backendMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? <AdminAlert type="error">{formError}</AdminAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div>
            <AdminFilterLabel>Ảnh từ máy</AdminFilterLabel>
            <input type="file" accept="image/*" onChange={handleFileChange} className={fileInputClassName} />
          </div>

          <div>
            <AdminFilterLabel>Nhóm màu của ảnh</AdminFilterLabel>
            <select name="color" value={formData.color || ""} onChange={handleChange} className={adminInputClassName}>
              <option value="">Ảnh chung cho mọi màu</option>
              {mergedColorOptions.map((color) => <option key={color} value={color}>{color}</option>)}
            </select>
            <p className="mt-2 text-xs text-slate-500">Ảnh chung sẽ làm ảnh fallback nếu nhóm màu đó chưa có ảnh riêng.</p>
          </div>

          <div>
            <AdminFilterLabel>URL ảnh</AdminFilterLabel>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Hoặc nhập URL nếu không upload ảnh mới" className={adminInputClassName} />
          </div>

          <div>
            <AdminFilterLabel>Thứ tự hiển thị</AdminFilterLabel>
            <input type="number" min="0" name="sortOrder" value={formData.sortOrder} onChange={handleChange} className={adminInputClassName} />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" name="isThumbnail" checked={formData.isThumbnail} onChange={handleChange} className={checkboxClassName} />
              <span>
                <span className="block font-semibold text-slate-900">Đặt làm thumbnail</span>
                <span className="mt-1 block">Ảnh thumbnail sẽ được ưu tiên hiển thị cho nhóm màu tương ứng.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Xem trước ảnh</p>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-72 w-full rounded-2xl border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">Chưa có ảnh xem trước</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={uploadingImage || submitting}>{uploadingImage ? "Đang upload ảnh..." : submitting ? "Đang lưu..." : "Lưu ảnh"}</AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminProductImageForm;
