import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        logoUrl: initialData.logoUrl || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData(defaultForm);
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="mb-1 block text-sm font-medium">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Logo URL</label>
        <input
          type="text"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {formData.logoUrl && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước logo</p>
          <img
            src={formData.logoUrl}
            alt="brand logo"
            className="h-20 w-20 rounded-lg object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
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
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : "Lưu"}
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