import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        imageUrl: initialData.imageUrl || "",
        isThumbnail: initialData.isThumbnail || false,
        sortOrder: initialData.sortOrder ?? 0,
      });
    } else {
      setFormData(defaultForm);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          required
        />
      </div>

      {formData.imageUrl && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước ảnh</p>
          <img
            src={formData.imageUrl}
            alt="preview"
            className="h-40 w-40 rounded-lg object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
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
          min="0"
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
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : "Lưu ảnh"}
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