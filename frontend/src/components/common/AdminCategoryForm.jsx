import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminFilterLabel,
  adminInputClassName,
} from "../admin/AdminShell";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
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

const AdminCategoryForm = ({ initialData = null, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData(defaultForm);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <AdminFilterLabel>Tên danh mục</AdminFilterLabel>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={adminInputClassName}
            placeholder="Ví dụ: Giày chạy bộ"
            required
          />
        </div>

        <div>
          <AdminFilterLabel>Slug</AdminFilterLabel>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={adminInputClassName}
            placeholder="giay-chay-bo"
            required
          />
        </div>
      </div>

      <div>
        <AdminFilterLabel>Mô tả</AdminFilterLabel>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          className={adminInputClassName}
          placeholder="Mô tả ngắn giúp admin dễ quản lý danh mục..."
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
            <span className="block font-semibold text-slate-900">Kích hoạt danh mục</span>
            <span className="mt-1 block">Nếu tắt, danh mục sẽ không còn hiển thị trên storefront.</span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting}>
          {submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo danh mục"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>
          Hủy
        </AdminButton>
      </div>
    </form>
  );
};

export default AdminCategoryForm;
