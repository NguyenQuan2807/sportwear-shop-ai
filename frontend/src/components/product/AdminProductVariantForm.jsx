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
  costPrice: "",
  stockQuantity: "",
  sku: "",
};

const sizeSuggestionGroups = [
  {
    title: "Size áo / quần",
    options: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  },
  {
    title: "Size giày",
    options: [
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
    ],
  },
  {
    title: "Phụ kiện / freesize",
    options: ["FREE SIZE"],
  },
];

const sizeSuggestions = Array.from(
  new Set(sizeSuggestionGroups.flatMap((group) => group.options)),
);

const normalizeSkuPart = (value) => {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildSku = ({ color, size }) => {
  const colorKey = normalizeSkuPart(color);
  const sizeKey = normalizeSkuPart(size);

  if (!colorKey || !sizeKey) return "";
  return `${colorKey}-${sizeKey}`;
};

const ChevronDownIcon = ({ open = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AdminProductVariantForm = ({
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        size: initialData.size || "",
        color: initialData.color || "",
        price: initialData.price ?? "",
        costPrice: initialData.costPrice ?? "",
        stockQuantity: initialData.stockQuantity ?? "",
        sku: initialData.sku || "",
      });
    } else {
      setFormData(defaultForm);
    }

    setShowSizePicker(false);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (!isEditing && (name === "size" || name === "color") && !prev.sku.trim()) {
        next.sku = buildSku({
          color: name === "color" ? value : prev.color,
          size: name === "size" ? value : prev.size,
        });
      }

      return next;
    });
  };

  const handlePickSize = (size) => {
    setFormData((prev) => {
      const next = { ...prev, size };

      if (!isEditing && !prev.sku.trim()) {
        next.sku = buildSku({
          color: prev.color,
          size,
        });
      }

      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedSize = String(formData.size || "").trim();
    const normalizedColor = String(formData.color || "").trim();

    onSubmit({
      ...formData,
      size: normalizedSize,
      color: normalizedColor,
      sku: String(formData.sku || "").trim(),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      stockQuantity: Number(formData.stockQuantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <AdminFilterLabel>Size</AdminFilterLabel>

          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className={adminInputClassName}
            placeholder="Ví dụ: M, XL, 40, 42.5, FREE SIZE"
            list="admin-product-variant-size-suggestions"
            required
          />

          <datalist id="admin-product-variant-size-suggestions">
            {sizeSuggestions.map((size) => (
              <option key={size} value={size} />
            ))}
          </datalist>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Có thể nhập size áo/quần, size giày hoặc size riêng tùy sản phẩm.
          </p>

          <button
            type="button"
            onClick={() => setShowSizePicker((prev) => !prev)}
            className="mt-3 inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            aria-expanded={showSizePicker}
          >
            <span>{showSizePicker ? "Ẩn chọn nhanh size" : "Chọn nhanh size"}</span>
            <ChevronDownIcon open={showSizePicker} />
          </button>

          {showSizePicker ? (
            <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              {sizeSuggestionGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((size) => {
                      const active = formData.size === size;

                      return (
                        <button
                          key={`${group.title}-${size}`}
                          type="button"
                          onClick={() => handlePickSize(size)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <AdminFilterLabel>Màu sắc</AdminFilterLabel>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className={adminInputClassName}
            placeholder="Ví dụ: Đỏ, Trắng, Xanh navy"
            required
          />
        </div>

        <div>
          <AdminFilterLabel>Giá bán</AdminFilterLabel>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={adminInputClassName}
            required
            min="0"
          />
          <p className="mt-2 text-xs text-slate-500">
            Giá khách hàng nhìn thấy trước khi áp khuyến mãi.
          </p>
        </div>

        <div>
          <AdminFilterLabel>Giá nhập</AdminFilterLabel>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            className={adminInputClassName}
            required
            min="0"
          />
          <p className="mt-2 text-xs text-slate-500">
            AI dùng giá nhập để không gợi ý giảm giá thấp hơn vốn.
          </p>
        </div>

        <div>
          <AdminFilterLabel>Tồn kho</AdminFilterLabel>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className={adminInputClassName}
            required
            min="0"
          />
        </div>
      </div>

      <div>
        <AdminFilterLabel>SKU</AdminFilterLabel>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          className={adminInputClassName}
          placeholder="Ví dụ: DO-TRANG-M hoặc DEN-42"
          required
        />
        <p className="mt-2 text-xs text-slate-500">
          Khi tạo biến thể mới, SKU sẽ tự gợi ý từ màu và size nếu bạn chưa nhập SKU.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting}>
          {submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo biến thể"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>
          Hủy
        </AdminButton>
      </div>
    </form>
  );
};

export default AdminProductVariantForm;
