import { useEffect, useState } from "react";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { getProductsApi } from "../../services/productService";
import { uploadAdminImageApi } from "../../services/uploadService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  AdminAlert,
  AdminButton,
  AdminFilterLabel,
  adminInputClassName,
} from "../admin/AdminShell";

const PROMOTION_TYPES = [
  { value: "FLASH_SALE", label: "Flash Sale" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "SPECIAL_EVENT", label: "Special Event" },
  { value: "NORMAL", label: "Normal" },
];

const DISCOUNT_TYPES = [
  { value: "PERCENT", label: "Giảm theo %" },
  { value: "FIXED_AMOUNT", label: "Giảm số tiền cố định" },
  { value: "FIXED_PRICE", label: "Giá cố định" },
];

const PROMOTION_STATUSES = [
  { value: "DRAFT", label: "Nháp" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "DISABLED", label: "Tắt" },
];

const TARGET_TYPES = [
  { value: "CATEGORY", label: "Danh mục" },
  { value: "BRAND", label: "Thương hiệu" },
  { value: "SPORT", label: "Môn thể thao" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "PRODUCT_VARIANT", label: "Biến thể sản phẩm" },
];

const DEFAULT_TARGET = {
  targetType: "CATEGORY",
  targetId: "",
};

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  promotionType: "FLASH_SALE",
  discountType: "PERCENT",
  discountValue: "",
  maxDiscountValue: "",
  priority: 0,
  startTime: "",
  endTime: "",
  status: "ACTIVE",
  isActive: true,
  bannerImageUrl: "",
  targets: [DEFAULT_TARGET],
};

const checkboxClassName = "h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500";
const fileInputClassName = `${adminInputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200`;

const AdminPromotionForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formError, setFormError] = useState("");

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [categoriesRes, brandsRes, sportsRes, productsRes] = await Promise.all([
          getCategoriesApi(),
          getBrandsApi(),
          getSportsApi(),
          getProductsApi({ page: 0, size: 200, sort: "nameAsc" }),
        ]);

        setCategories(categoriesRes.data || []);
        setBrands(brandsRes.data || []);
        setSports(sportsRes.data || []);
        setProducts(productsRes.data?.content || []);
      } catch (error) {
        setFormError("Không thể tải dữ liệu cho form promotion");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        promotionType: initialData.promotionType || "FLASH_SALE",
        discountType: initialData.discountType || "PERCENT",
        discountValue: initialData.discountValue ?? "",
        maxDiscountValue: initialData.maxDiscountValue ?? "",
        priority: initialData.priority ?? 0,
        startTime: initialData.startTime ? initialData.startTime.slice(0, 16) : "",
        endTime: initialData.endTime ? initialData.endTime.slice(0, 16) : "",
        status: initialData.status || "ACTIVE",
        isActive: initialData.isActive ?? true,
        bannerImageUrl: initialData.bannerImageUrl || "",
        targets:
          initialData.targets?.length > 0
            ? initialData.targets.map((item) => ({
                targetType: item.targetType,
                targetId: item.targetId,
              }))
            : [DEFAULT_TARGET],
      });

      setBannerPreview(initialData.bannerImageUrl ? resolveImageUrl(initialData.bannerImageUrl) : "");
    } else {
      setFormData(defaultForm);
      setBannerPreview("");
    }

    setBannerFile(null);
    setFormError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const clearBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    setFormData((prev) => ({ ...prev, bannerImageUrl: "" }));
  };

  const handleTargetChange = (index, field, value) => {
    setFormData((prev) => {
      const nextTargets = [...prev.targets];
      nextTargets[index] = {
        ...nextTargets[index],
        [field]: value,
        ...(field === "targetType" ? { targetId: "" } : {}),
      };

      return {
        ...prev,
        targets: nextTargets,
      };
    });
  };

  const handleAddTarget = () => {
    setFormData((prev) => ({
      ...prev,
      targets: [...prev.targets, { ...DEFAULT_TARGET }],
    }));
  };

  const handleRemoveTarget = (index) => {
    setFormData((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index),
    }));
  };

  const getTargetOptions = (targetType) => {
    switch (targetType) {
      case "CATEGORY":
        return categories.map((item) => ({ value: item.id, label: item.name }));
      case "BRAND":
        return brands.map((item) => ({ value: item.id, label: item.name }));
      case "SPORT":
        return sports.map((item) => ({ value: item.id, label: item.name }));
      case "PRODUCT":
        return products.map((item) => ({ value: item.id, label: item.name }));
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      maxDiscountValue: formData.maxDiscountValue === "" ? null : Number(formData.maxDiscountValue),
      priority: Number(formData.priority),
      targets: formData.targets.map((item) => ({
        targetType: item.targetType,
        targetId: Number(item.targetId),
      })),
    };

    try {
      if (bannerFile) {
        setUploadingImage(true);
        const uploadRes = await uploadAdminImageApi(bannerFile, "promotions");
        payload.bannerImageUrl = uploadRes.data.url;
      }

      await onSubmit(payload);
    } catch (error) {
      setFormError(error?.response?.data?.message || "Không thể lưu chương trình khuyến mãi");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? <AdminAlert type="error">{formError}</AdminAlert> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Tên chương trình</AdminFilterLabel>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={adminInputClassName} required />
            </div>
            <div>
              <AdminFilterLabel>Slug</AdminFilterLabel>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={adminInputClassName} required />
            </div>
          </div>

          <div>
            <AdminFilterLabel>Mô tả</AdminFilterLabel>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className={adminInputClassName} />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <AdminFilterLabel>Loại chương trình</AdminFilterLabel>
              <select name="promotionType" value={formData.promotionType} onChange={handleChange} className={adminInputClassName}>
                {PROMOTION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Kiểu giảm giá</AdminFilterLabel>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className={adminInputClassName}>
                {DISCOUNT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Trạng thái</AdminFilterLabel>
              <select name="status" value={formData.status} onChange={handleChange} className={adminInputClassName}>
                {PROMOTION_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <AdminFilterLabel>Giá trị giảm</AdminFilterLabel>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className={adminInputClassName} required />
            </div>
            <div>
              <AdminFilterLabel>Giảm tối đa</AdminFilterLabel>
              <input type="number" name="maxDiscountValue" value={formData.maxDiscountValue} onChange={handleChange} className={adminInputClassName} />
            </div>
            <div>
              <AdminFilterLabel>Priority</AdminFilterLabel>
              <input type="number" name="priority" value={formData.priority} onChange={handleChange} className={adminInputClassName} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <AdminFilterLabel>Bắt đầu</AdminFilterLabel>
              <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className={adminInputClassName} required />
            </div>
            <div>
              <AdminFilterLabel>Kết thúc</AdminFilterLabel>
              <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className={adminInputClassName} required />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className={checkboxClassName} />
              <span>
                <span className="block font-semibold text-slate-900">Kích hoạt chương trình</span>
                <span className="mt-1 block">Bạn có thể bật/tắt nhanh mà không cần xóa chương trình khuyến mãi.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <AdminFilterLabel>Banner ảnh</AdminFilterLabel>
            <input type="file" accept="image/*" onChange={handleBannerChange} className={fileInputClassName} />
            <p className="mt-2 text-xs leading-5 text-slate-500">Ưu tiên ảnh ngang nổi bật để dùng cho banner hoặc spotlight promotion.</p>
          </div>

          <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Xem trước banner</p>
              {bannerPreview ? <AdminButton type="button" variant="danger" className="px-3 py-2 text-xs" onClick={clearBanner}>Xóa ảnh</AdminButton> : null}
            </div>
            {bannerPreview ? (
              <img src={bannerPreview} alt="promotion banner preview" className="h-52 w-full rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">Chưa có banner</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Targets áp dụng</h3>
            <p className="mt-1 text-sm text-slate-500">Chọn danh mục, thương hiệu, môn thể thao hoặc sản phẩm cần áp dụng khuyến mãi.</p>
          </div>
          <AdminButton type="button" variant="brand" onClick={handleAddTarget}>Thêm target</AdminButton>
        </div>

        <div className="space-y-4">
          {formData.targets.map((target, index) => {
            const options = getTargetOptions(target.targetType);

            return (
              <div key={index} className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1.4fr_140px]">
                <div>
                  <AdminFilterLabel>Loại target</AdminFilterLabel>
                  <select value={target.targetType} onChange={(e) => handleTargetChange(index, "targetType", e.target.value)} className={adminInputClassName}>
                    {TARGET_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div>
                  <AdminFilterLabel>Đối tượng áp dụng</AdminFilterLabel>
                  <select
                    value={target.targetId}
                    onChange={(e) => handleTargetChange(index, "targetId", e.target.value)}
                    className={adminInputClassName}
                    disabled={loadingOptions || target.targetType === "PRODUCT_VARIANT"}
                    required
                  >
                    <option value="">Chọn đối tượng</option>
                    {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  {target.targetType === "PRODUCT_VARIANT" ? (
                    <p className="mt-2 text-xs text-amber-600">Tạm thời nên dùng PRODUCT trước. PRODUCT_VARIANT sẽ làm tốt hơn ở bước sau.</p>
                  ) : null}
                </div>

                <div className="flex items-end">
                  <AdminButton
                    type="button"
                    variant="danger"
                    className="w-full"
                    onClick={() => handleRemoveTarget(index)}
                    disabled={formData.targets.length === 1}
                  >
                    Xóa
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <AdminButton type="submit" variant="brand" disabled={submitting || uploadingImage}>
          {uploadingImage ? "Đang upload ảnh..." : submitting ? "Đang lưu..." : "Lưu chương trình"}
        </AdminButton>
        <AdminButton type="button" variant="light" onClick={onCancel}>Hủy</AdminButton>
      </div>
    </form>
  );
};

export default AdminPromotionForm;
