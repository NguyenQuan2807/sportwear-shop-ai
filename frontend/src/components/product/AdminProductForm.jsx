import { useEffect, useState } from "react";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  brandId: "",
  sportId: "",
  gender: "UNISEX",
  material: "",
  thumbnailUrl: "",
  isActive: true,
};

const AdminProductForm = ({
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId || "",
        brandId: initialData.brandId || "",
        sportId: initialData.sportId || "",
        gender: initialData.gender || "UNISEX",
        material: initialData.material || "",
        thumbnailUrl: initialData.thumbnailUrl || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const [categoryRes, brandRes, sportRes] = await Promise.all([
          getCategoriesApi(),
          getBrandsApi(),
          getSportsApi(),
        ]);

        setCategories(categoryRes.data || []);
        setBrands(brandRes.data || []);
        setSports(sportRes.data || []);
      } catch (error) {
        console.error("Không thể tải dữ liệu form", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? e.target.checked
          : ["categoryId", "brandId", "sportId"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loadingOptions) {
    return <div className="p-4">Đang tải dữ liệu form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Tên sản phẩm</label>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Danh mục</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Thương hiệu</label>
          <select
            name="brandId"
            value={formData.brandId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          >
            <option value="">Chọn thương hiệu</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Môn thể thao</label>
          <select
            name="sportId"
            value={formData.sportId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            required
          >
            <option value="">Chọn môn thể thao</option>
            {sports.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Giới tính</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="UNISEX">UNISEX</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Chất liệu</label>
          <input
            type="text"
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Thumbnail URL</label>
          <input
            type="text"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>
      </div>

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

export default AdminProductForm;