import { useEffect, useState } from "react";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { uploadAdminImageApi } from "../../services/uploadService";

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

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setThumbnailPreview(initialData.thumbnailUrl || "");
    } else {
      setFormData(defaultForm);
      setThumbnailPreview("");
    }

    setThumbnailFile(null);
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
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["categoryId", "brandId", "sportId"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    if (thumbnailFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(
          thumbnailFile,
          "products/thumbnails"
        );
        payload.thumbnailUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  if (loadingOptions) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        Đang tải dữ liệu form...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
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
          <label className="mb-1 block text-sm font-medium">Ảnh thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>
      </div>

      {thumbnailPreview && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Xem trước thumbnail</p>
          <img
            src={thumbnailPreview}
            alt="product thumbnail"
            className="h-32 w-32 rounded-lg object-cover"
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
          disabled={submitting || uploadingImage}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {uploadingImage
            ? "Đang upload ảnh..."
            : submitting
            ? "Đang lưu..."
            : "Lưu"}
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