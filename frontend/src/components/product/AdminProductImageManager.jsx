import { useEffect, useMemo, useState } from "react";
import {
  createAdminProductImageApi,
  deleteAdminProductImageApi,
  getAdminProductImagesApi,
  updateAdminProductImageApi,
} from "../../services/adminProductImageService";
import { getAdminProductVariantsApi } from "../../services/adminProductVariantService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import AdminProductImageForm from "./AdminProductImageForm";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminMetricCard,
} from "../admin/AdminShell";

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const getColorLabel = (color) => (color ? color : "Ảnh chung");

const AdminProductImageManager = ({ product, onClose }) => {
  const [images, setImages] = useState([]);
  const [variantColors, setVariantColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeColorFilter, setActiveColorFilter] = useState("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const [imagesRes, variantsRes] = await Promise.all([
        getAdminProductImagesApi(product.id),
        getAdminProductVariantsApi(product.id),
      ]);
      const sortedImages = [...(imagesRes.data || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const uniqueColors = Array.from(new Set((variantsRes.data || []).map((item) => String(item.color || "").trim()).filter(Boolean)));
      setImages(sortedImages);
      setVariantColors(uniqueColors);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể tải dữ liệu ảnh sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (product?.id) fetchData(); }, [product]);

  const allColorTabs = useMemo(() => {
    const imageColors = images.map((item) => String(item.color || "").trim()).filter(Boolean);
    const merged = Array.from(new Set([...variantColors, ...imageColors]));
    return ["ALL", "", ...merged];
  }, [images, variantColors]);

  const filteredImages = useMemo(() => {
    if (activeColorFilter === "ALL") return images;
    const active = normalizeText(activeColorFilter);
    return images.filter((item) => normalizeText(item.color) === active);
  }, [images, activeColorFilter]);

  const groupedImages = useMemo(() => {
    const map = new Map();
    filteredImages.forEach((image) => {
      const rawColor = String(image.color || "").trim();
      const key = rawColor || "__COMMON__";
      if (!map.has(key)) map.set(key, { key, color: rawColor, label: getColorLabel(rawColor), items: [] });
      map.get(key).items.push(image);
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.key === "__COMMON__") return -1;
      if (b.key === "__COMMON__") return 1;
      return a.label.localeCompare(b.label, "vi");
    });
  }, [filteredImages]);

  const imageCountByColor = (color) => {
    if (color === "ALL") return images.length;
    return images.filter((item) => normalizeText(item.color) === normalizeText(color)).length;
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      if (editingImage) {
        await updateAdminProductImageApi(editingImage.id, formData);
        setSuccessMessage("Cập nhật ảnh thành công");
      } else {
        await createAdminProductImageApi(product.id, formData);
        setSuccessMessage("Tạo ảnh thành công");
      }
      setShowForm(false);
      setEditingImage(null);
      fetchData();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể lưu ảnh");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminProductImageApi(imageId);
      setSuccessMessage("Xóa ảnh thành công");
      fetchData();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa ảnh");
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200/70 bg-[#F5F7FB] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-[32px] border-b border-slate-200/70 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Quản lý ảnh sản phẩm theo màu</h2>
            <p className="mt-1 text-sm text-slate-500">{product.name}</p>
          </div>
          <AdminButton type="button" variant="light" onClick={onClose}>Đóng</AdminButton>
        </div>

        <div className="space-y-6 p-6">
          {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
          {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <AdminMetricCard label="Tổng ảnh" value={images.length} helper="Tất cả ảnh hiện có" tone="brand" />
            <AdminMetricCard label="Nhóm màu" value={allColorTabs.length - 1} helper="Bao gồm ảnh chung và ảnh theo màu" tone="violet" />
            <AdminMetricCard label="Thumbnail" value={images.filter((item) => item.isThumbnail).length} helper="Ảnh được đánh dấu làm thumbnail" tone="emerald" />
          </div>

          <AdminCard title="Nhóm ảnh theo màu" description="Mỗi màu nên có ảnh thumbnail riêng để khách đổi màu là thấy đúng ảnh ngay." action={<AdminButton type="button" variant="brand" onClick={() => { setEditingImage(null); setShowForm(true); }}>Thêm ảnh</AdminButton>}>
            <div className="flex flex-wrap gap-2">
              {allColorTabs.map((tab) => {
                const isActive = tab === activeColorFilter;
                const label = tab === "ALL" ? "Tất cả" : getColorLabel(tab);
                return (
                  <button
                    key={tab === "" ? "common" : String(tab)}
                    type="button"
                    onClick={() => setActiveColorFilter(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    {label} ({imageCountByColor(tab)})
                  </button>
                );
              })}
            </div>
          </AdminCard>

          {showForm ? (
            <AdminCard title={editingImage ? "Cập nhật ảnh" : "Tạo ảnh mới"}>
              <AdminProductImageForm initialData={editingImage} colorOptions={variantColors} onSubmit={handleSubmitForm} submitting={submitting} onCancel={() => { setEditingImage(null); setShowForm(false); }} />
            </AdminCard>
          ) : null}

          {loading ? (
            <AdminCard><div className="text-sm text-slate-500">Đang tải ảnh sản phẩm...</div></AdminCard>
          ) : groupedImages.length === 0 ? (
            <AdminCard><div className="text-sm text-slate-500">Chưa có ảnh nào trong nhóm này.</div></AdminCard>
          ) : (
            <div className="space-y-6">
              {groupedImages.map((group) => (
                <AdminCard key={group.key} title={group.label} description={`${group.items.length} ảnh • ${group.items.filter((item) => item.isThumbnail).length} thumbnail`}>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                        <img src={resolveImageUrl(image.imageUrl)} alt={group.label} className="h-64 w-full object-cover" />
                        <div className="space-y-3 p-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Sort: {image.sortOrder || 0}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${image.isThumbnail ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{image.isThumbnail ? "Thumbnail" : "Ảnh phụ"}</span>
                          </div>
                          <p className="break-all text-xs leading-5 text-slate-500">{image.imageUrl}</p>
                          <div className="flex flex-wrap gap-2">
                            <AdminButton type="button" variant="warning" className="px-4 py-2 text-xs" onClick={() => { setEditingImage(image); setShowForm(true); }}>Sửa</AdminButton>
                            <AdminButton type="button" variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(image.id)}>Xóa</AdminButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductImageManager;
