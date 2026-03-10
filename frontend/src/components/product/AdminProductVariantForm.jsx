import { useEffect, useState } from "react";

const defaultForm = {
  size: "",
  color: "",
  price: "",
  stockQuantity: "",
  sku: "",
};

const AdminProductVariantForm = ({
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);

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

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stockQuantity"
          ? value
          : value,
    }));
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Size</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Màu sắc</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Giá</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
            min="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tồn kho</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">SKU</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : "Lưu biến thể"}
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

export default AdminProductVariantForm;