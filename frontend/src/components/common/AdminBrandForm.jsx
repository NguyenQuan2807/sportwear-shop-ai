import { useEffect, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  isActive: true,
};

const AdminBrandForm = ({
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        logoUrl: initialData.logoUrl || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setLogoPreview(initialData.logoUrl || "");
    } else {
      setFormData(defaultForm);
      setLogoPreview("");
    }

    setLogoFile(null);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    if (logoFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(logoFile, "brands");
        payload.logoUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Tên thương hiệu</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Chọn logo từ máy</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {logoPreview && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước logo</p>
          <img
            src={logoPreview}
            alt="brand logo"
            className="h-24 w-24 rounded-lg object-cover"
          />
        </div>
      )}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <span className="text-sm font-medium">Đang hoạt động</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {uploadingImage
            ? "Đang upload ảnh..."
            : submitting
            ? "Đang lưu..."
            : "Lưu"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AdminBrandForm;