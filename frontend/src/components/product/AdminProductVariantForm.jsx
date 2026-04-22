import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminFilterLabel,
  adminInputClassName,
} from "../admin/AdminShell";

const defaultForm = {
  size: "",
  color: "",
  price: "",
  stockQuantity: "",
  sku: "",
};

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const buildSku = ({ color, size }) => {
  const colorKey = String(color || "").trim().toUpperCase().replace(/\s+/g, "-");
  const sizeKey = String(size || "").trim().toUpperCase();
  if (!colorKey || !sizeKey) return "";
  return `${colorKey}-${sizeKey}`;
};

const AdminProductVariantForm = ({ initialData = null, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        size: initialData.size || "",
        color: initialData.color || "",
        price: initialData.price ?? "",
        stockQuantity: initialData.stockQuantity ?? "",
        sku: initialData.sku || "",
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (!isEditing && (name === "size" || name === "color") && !prev.sku.trim()) {
        next.sku = buildSku({ color: name === "color" ? value : prev.color, size: name === "size" ? value : prev.size });
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <AdminFilterLabel>Size</AdminFilterLabel>
          <select name="size" value={formData.size} onChange={handleChange} className={adminInputClassName} required>
            <option value="">Chọn size</option>
            {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <div>
          <AdminFilterLabel>Màu sắc</AdminFilterLabel>
          <input type="text" name="color" value={formData.color} onChange={handleChange} className={adminInputClassName} placeholder="Ví dụ: Đỏ, Trắng, Xanh navy" required />
        </div>
        <div>
          <AdminFilterLabel>Giá bán</AdminFilterLabel>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className={adminInputClassName} required min="0" />
        </div>
        <div>
          <AdminFilterLabel>Tồn kho</AdminFilterLabel>
          <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className={adminInputClassName} required min="0" />
        </div>
      </div>

      <div>
        <AdminFilterLabel>SKU</AdminFilterLabel>
        <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={adminInputClassName} placeholder="Do-trang-M hoặc mã riêng của bạn" required />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting}>{submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo biến thể"}</AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminProductVariantForm;
