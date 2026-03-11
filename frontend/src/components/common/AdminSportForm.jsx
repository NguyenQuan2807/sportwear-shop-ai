import { useEffect, useState } from "react";

const AdminSportForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    iconUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        iconUrl: initialData.iconUrl || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tên môn thể thao</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Ví dụ: Running"
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
          placeholder="running"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          rows="4"
          placeholder="Nhập mô tả môn thể thao"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">Icon URL</label>
        <input
          type="text"
          name="iconUrl"
          value={formData.iconUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="https://example.com/icon.png"
        />
      </div>

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
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Đang lưu..." : "Lưu"}
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