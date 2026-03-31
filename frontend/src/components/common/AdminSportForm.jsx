import { useEffect, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  iconUrl: "",
  isActive: true,
};

const AdminSportForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        iconUrl: initialData.iconUrl || "",
        isActive: initialData.isActive ?? true,
      });
      setIconPreview(initialData.iconUrl || "");
    } else {
      setFormData(defaultForm);
      setIconPreview("");
    }

    setIconFile(null);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    if (iconFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(iconFile, "sports");
        payload.iconUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tên môn thể thao</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Slug</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Chọn icon từ máy</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleIconChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {iconPreview && (
        <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước icon</p>
          <img
            src={iconPreview}
            alt="sport icon"
            className="h-24 w-24 rounded-lg object-cover"
          />
        </div>
      )}

      <div className="md:col-span-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Hoạt động
        </label>
      </div>

      <div className="md:col-span-2 flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
          className="rounded-lg bg-slate-200 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-300"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AdminSportForm;