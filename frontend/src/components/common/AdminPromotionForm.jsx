import { useEffect, useState } from "react";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { getProductsApi } from "../../services/productService";
import { uploadAdminImageApi } from "../../services/uploadService";

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

const AdminPromotionForm = ({ initialData, onSubmit, submitting, onCancel }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

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
        console.error("Không thể tải dữ liệu promotion form", error);
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

      setBannerPreview(initialData.bannerImageUrl || "");
    } else {
      setFormData(defaultForm);
      setBannerPreview("");
    }

    setBannerFile(null);
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
      maxDiscountValue:
        formData.maxDiscountValue === "" ? null : Number(formData.maxDiscountValue),
      priority: Number(formData.priority),
      targets: formData.targets.map((item) => ({
        targetType: item.targetType,
        targetId: Number(item.targetId),
      })),
    };

    if (bannerFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await uploadAdminImageApi(bannerFile, "promotions");
        payload.bannerImageUrl = uploadRes.data.url;
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tên chương trình</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Loại chương trình</label>
          <select
            name="promotionType"
            value={formData.promotionType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {PROMOTION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kiểu giảm giá</label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {DISCOUNT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Giá trị giảm</label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Giảm tối đa</label>
          <input
            type="number"
            name="maxDiscountValue"
            value={formData.maxDiscountValue}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {PROMOTION_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Bắt đầu</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kết thúc</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Banner ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {bannerPreview && (
          <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Xem trước banner</p>
            <img
              src={bannerPreview}
              alt="promotion banner"
              className="h-40 w-full rounded-lg object-cover md:w-80"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Kích hoạt chương trình
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Targets áp dụng</h3>
          <button
            type="button"
            onClick={handleAddTarget}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Thêm target
          </button>
        </div>

        <div className="space-y-4">
          {formData.targets.map((target, index) => {
            const options = getTargetOptions(target.targetType);

            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Loại target
                  </label>
                  <select
                    value={target.targetType}
                    onChange={(e) =>
                      handleTargetChange(index, "targetType", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {TARGET_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Đối tượng áp dụng
                  </label>
                  <select
                    value={target.targetId}
                    onChange={(e) =>
                      handleTargetChange(index, "targetId", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    disabled={loadingOptions || target.targetType === "PRODUCT_VARIANT"}
                    required
                  >
                    <option value="">Chọn đối tượng</option>
                    {options.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  {target.targetType === "PRODUCT_VARIANT" && (
                    <p className="mt-1 text-xs text-orange-600">
                      Tạm thời nên dùng PRODUCT trước. PRODUCT_VARIANT sẽ làm tốt hơn ở bước tiếp theo.
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveTarget(index)}
                    disabled={formData.targets.length === 1}
                    className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Xóa target
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadingImage
            ? "Đang upload ảnh..."
            : submitting
            ? "Đang lưu..."
            : "Lưu chương trình"}
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

export default AdminPromotionForm;