import { useEffect, useMemo, useState } from "react";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { uploadAdminImageApi } from "../../services/uploadService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  AdminAlert,
  AdminButton,
  AdminFilterLabel,
  adminInputClassName,
} from "../admin/AdminShell";

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

const genderOptions = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "UNISEX", label: "Unisex" },
];

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const checkboxClassName = "h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500";
const fileInputClassName = `${adminInputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200`;

const AdminProductForm = ({ initialData = null, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData]);

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
      setThumbnailPreview(initialData.thumbnailUrl ? resolveImageUrl(initialData.thumbnailUrl) : "");
    } else {
      setFormData(defaultForm);
      setThumbnailPreview("");
    }

    setThumbnailFile(null);
    setFormError("");
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
        setFormError("Không thể tải dữ liệu cho form sản phẩm");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : ["categoryId", "brandId", "sportId"].includes(name)
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };

      if (name === "name" && !isEditing && !prev.slug.trim()) {
        nextData.slug = slugify(value);
      }

      return nextData;
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    let payload = { ...formData };

    try {
      if (thumbnailFile) {
        setUploadingImage(true);
        const uploadRes = await uploadAdminImageApi(thumbnailFile, "products/thumbnails");
        payload.thumbnailUrl = uploadRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể lưu sản phẩm";
      setFormError(backendMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loadingOptions) {
    return <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">Đang tải dữ liệu form sản phẩm...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <AdminAlert type="error">{formError}</AdminAlert> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Tên sản phẩm</AdminFilterLabel>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={adminInputClassName} placeholder="Ví dụ: Áo đá bóng sân cỏ" required />
            </div>
            <div>
              <AdminFilterLabel>Slug</AdminFilterLabel>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={adminInputClassName} placeholder="ao-da-bong-san-co" required />
            </div>
          </div>

          <div>
            <AdminFilterLabel>Mô tả</AdminFilterLabel>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={adminInputClassName} placeholder="Mô tả sản phẩm ngắn gọn, dễ hiểu và hữu ích cho admin." />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <AdminFilterLabel>Danh mục</AdminFilterLabel>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={adminInputClassName} required>
                <option value="">Chọn danh mục</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Thương hiệu</AdminFilterLabel>
              <select name="brandId" value={formData.brandId} onChange={handleChange} className={adminInputClassName} required>
                <option value="">Chọn thương hiệu</option>
                {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Môn thể thao</AdminFilterLabel>
              <select name="sportId" value={formData.sportId} onChange={handleChange} className={adminInputClassName} required>
                <option value="">Chọn môn thể thao</option>
                {sports.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Giới tính</AdminFilterLabel>
              <select name="gender" value={formData.gender} onChange={handleChange} className={adminInputClassName}>
                {genderOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Chất liệu</AdminFilterLabel>
              <input type="text" name="material" value={formData.material} onChange={handleChange} className={adminInputClassName} placeholder="Polyester, vải thun lạnh, mesh..." />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className={checkboxClassName} />
              <span>
                <span className="block font-semibold text-slate-900">Kích hoạt sản phẩm</span>
                <span className="mt-1 block">Khi tắt, sản phẩm sẽ không hiển thị bán ra ngoài storefront.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <AdminFilterLabel>Thumbnail sản phẩm</AdminFilterLabel>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} className={fileInputClassName} />
            <p className="mt-2 text-xs leading-5 text-slate-500">Nên dùng ảnh rõ sản phẩm, tỷ lệ vuông hoặc gần vuông để bảng quản trị hiển thị đẹp hơn.</p>
          </div>

          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Xem trước thumbnail</p>
              {thumbnailPreview ? <AdminButton type="button" variant="danger" className="px-3 py-2 text-xs" onClick={clearThumbnail}>Xóa ảnh</AdminButton> : null}
            </div>
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="product thumbnail preview" className="h-64 w-full rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">Chưa có thumbnail</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting || uploadingImage}>
          {uploadingImage ? "Đang upload ảnh..." : submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminProductForm;
