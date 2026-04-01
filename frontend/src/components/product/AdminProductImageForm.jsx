import { useEffect, useMemo, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";

const defaultForm = {
  imageUrl: "",
  color: "",
  isThumbnail: false,
  sortOrder: 0,
};

const AdminProductImageForm = ({
  initialData = null,
  colorOptions = [],
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const mergedColorOptions = useMemo(() => {
    const set = new Set(
      (colorOptions || [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    );

    const currentColor = String(initialData?.color || "").trim();
    if (currentColor) {
      set.add(currentColor);
    }

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
      setPreviewUrl(initialData.imageUrl || "");
    } else {
      setFormData(defaultForm);
      setPreviewUrl("");
    }

    setImageFile(null);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "sortOrder"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      ...formData,
      color: String(formData.color || "").trim(),
    };

    if (!payload.color) {
      payload.color = null;
    }

    if (imageFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(imageFile, "products/gallery");
        payload.imageUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Chọn ảnh từ máy
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      {previewUrl && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước ảnh</p>
          <img
            src={previewUrl}
            alt="Preview"
            className="h-40 w-40 rounded-xl object-cover border border-slate-200"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Nhóm màu của ảnh
        </label>
        <select
          name="color"
          value={formData.color || ""}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Ảnh chung cho mọi màu</option>
          {mergedColorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Ảnh chung sẽ được dùng làm fallback nếu màu đó chưa có bộ ảnh riêng.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          URL ảnh
        </label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Hoặc nhập URL ảnh nếu không upload"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Thứ tự hiển thị
        </label>
        <input
          type="number"
          min="0"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          name="isThumbnail"
          checked={formData.isThumbnail}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-slate-700">
          Đặt làm ảnh thumbnail của nhóm màu này
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={uploadingImage || submitting}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {uploadingImage
            ? "Đang upload ảnh..."
            : submitting
            ? "Đang lưu..."
            : "Lưu ảnh"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AdminProductImageForm;