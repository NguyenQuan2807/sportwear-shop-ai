import { useEffect, useMemo, useState } from "react";
import {
  createAdminProductImageApi,
  deleteAdminProductImageApi,
  getAdminProductImagesApi,
  updateAdminProductImageApi,
} from "../../services/adminProductImageService";
import { getAdminProductVariantsApi } from "../../services/adminProductVariantService";
import AdminProductImageForm from "./AdminProductImageForm";

const normalizeText = (value) =>
  String(value || "").trim().toLowerCase();

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

      const sortedImages = [...(imagesRes.data || [])].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );

      const uniqueColors = Array.from(
        new Set(
          (variantsRes.data || [])
            .map((item) => String(item.color || "").trim())
            .filter(Boolean)
        )
      );

      setImages(sortedImages);
      setVariantColors(uniqueColors);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải dữ liệu ảnh sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchData();
    }
  }, [product]);

  const allColorTabs = useMemo(() => {
    const imageColors = images
      .map((item) => String(item.color || "").trim())
      .filter(Boolean);

    const merged = Array.from(new Set([...variantColors, ...imageColors]));

    return ["ALL", "", ...merged];
  }, [images, variantColors]);

  const filteredImages = useMemo(() => {
    if (activeColorFilter === "ALL") {
      return images;
    }

    const active = normalizeText(activeColorFilter);

    return images.filter(
      (item) => normalizeText(item.color) === active
    );
  }, [images, activeColorFilter]);

  const groupedImages = useMemo(() => {
    const map = new Map();

    filteredImages.forEach((image) => {
      const rawColor = String(image.color || "").trim();
      const key = rawColor || "__COMMON__";

      if (!map.has(key)) {
        map.set(key, {
          key,
          color: rawColor,
          label: getColorLabel(rawColor),
          items: [],
        });
      }

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
    return images.filter(
      (item) => normalizeText(item.color) === normalizeText(color)
    ).length;
  };

  const handleCreateClick = () => {
    setEditingImage(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = (image) => {
    setEditingImage(image);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ảnh này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminProductImageApi(imageId);
      setSuccessMessage("Xóa ảnh thành công");
      fetchData();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa ảnh";
      setErrorMessage(backendMessage);
    }
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
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu ảnh";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setEditingImage(null);
    setShowForm(false);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Quản lý ảnh sản phẩm theo màu
            </h2>
            <p className="mt-1 text-sm text-slate-500">{product.name}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-6 p-6">
          {successMessage && (
            <div className="rounded-xl bg-green-100 p-4 text-green-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-red-100 p-4 text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Nhóm ảnh theo màu
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Mỗi màu nên có 1 ảnh thumbnail riêng để khách đổi màu là đổi đúng ảnh.
                </p>
              </div>

              <button
                onClick={handleCreateClick}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Thêm ảnh
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allColorTabs.map((tab) => {
                const isActive = tab === activeColorFilter;
                const label =
                  tab === "ALL" ? "Tất cả" : getColorLabel(tab);

                return (
                  <button
                    key={tab === "" ? "common" : String(tab)}
                    type="button"
                    onClick={() => setActiveColorFilter(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {label} ({imageCountByColor(tab)})
                  </button>
                );
              })}
            </div>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                {editingImage ? "Cập nhật ảnh" : "Tạo ảnh mới"}
              </h3>

              <AdminProductImageForm
                initialData={editingImage}
                colorOptions={variantColors}
                onSubmit={handleSubmitForm}
                submitting={submitting}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow">
              Đang tải ảnh sản phẩm...
            </div>
          ) : groupedImages.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow">
              Chưa có ảnh nào trong nhóm này.
            </div>
          ) : (
            <div className="space-y-6">
              {groupedImages.map((group) => (
                <div
                  key={group.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {group.label}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {group.items.length} ảnh trong nhóm này
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                      {group.items.filter((item) => item.isThumbnail).length} thumbnail
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <img
                          src={image.imageUrl}
                          alt={group.label}
                          className="h-56 w-full object-cover"
                        />

                        <div className="space-y-3 p-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              Sort: {image.sortOrder || 0}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                image.isThumbnail
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {image.isThumbnail ? "Thumbnail" : "Ảnh phụ"}
                            </span>
                          </div>

                          <p className="break-all text-xs text-slate-500">
                            {image.imageUrl}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEditClick(image)}
                              className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                            >
                              Sửa
                            </button>

                            <button
                              onClick={() => handleDelete(image.id)}
                              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductImageManager;