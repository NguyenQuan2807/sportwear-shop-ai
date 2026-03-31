import { useEffect, useState } from "react";
import { uploadAdminImageApi } from "../../services/uploadService";

const defaultForm = {
  imageUrl: "",
  isThumbnail: false,
  sortOrder: 0,
};

const AdminProductImageForm = ({
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        imageUrl: initialData.imageUrl || "",
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

    let payload = { ...formData };

    if (imageFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(
          imageFile,
          "products/gallery"
        );
        payload.imageUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Chọn ảnh từ máy</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {previewUrl && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước ảnh</p>
          <img
            src={previewUrl}
            alt="preview"
            className="h-40 w-40 rounded-lg object-cover"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Thứ tự hiển thị</label>
        <input
          type="number"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          min={0}
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isThumbnail"
          checked={formData.isThumbnail}
          onChange={handleChange}
        />
        <span className="text-sm font-medium">Đặt làm ảnh thumbnail</span>
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
            : "Lưu ảnh"}
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

export default AdminProductImageForm;