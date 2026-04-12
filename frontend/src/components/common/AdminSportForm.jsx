import { useEffect, useMemo, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";

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

const AdminSportForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        isActive: initialData.isActive ?? true,
      });
      setImagePreview(initialData.imageUrl || "");
    } else {
      setFormData(defaultForm);
      setImagePreview("");
    }

    setImageFile(null);
    setFormError("");
  }, [initialData]);

  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

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
      setUploadingImage(true);

      if (imageFile) {
        const uploadImageRes = await uploadAdminImageApi(imageFile, "sports");
        payload.imageUrl = uploadImageRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể upload ảnh môn thể thao";
      setFormError(backendMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
      {formError ? (
        <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tên môn thể thao
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Ví dụ: Bóng đá"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Ví dụ: bong-da"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Mô tả ngắn về môn thể thao"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Chọn ảnh môn thể thao
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <p className="mt-2 text-xs text-slate-500">
          Ảnh này sẽ được dùng cho card “Mua sắm theo môn thể thao” ngoài homepage.
        </p>
      </div>

      {imagePreview ? (
        <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              Xem trước ảnh môn thể thao
            </p>
            <button
              type="button"
              onClick={clearImage}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Xóa ảnh
            </button>
          </div>
          <img
            src={imagePreview}
            alt="sport preview"
            className="h-56 w-full object-cover ring-1 ring-slate-200"
          />
        </div>
      ) : null}

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
