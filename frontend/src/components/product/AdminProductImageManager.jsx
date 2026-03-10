import { useEffect, useState } from "react";
import {
  createAdminProductImageApi,
  deleteAdminProductImageApi,
  getAdminProductImagesApi,
  updateAdminProductImageApi,
} from "../../services/adminProductImageService";
import AdminProductImageForm from "./AdminProductImageForm";

const AdminProductImageManager = ({ product, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminProductImagesApi(product.id);
      const sorted = [...(response.data || [])].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      setImages(sorted);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách ảnh";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchImages();
    }
  }, [product]);

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
      fetchImages();
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
      fetchImages();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Quản lý ảnh sản phẩm
            </h2>
            <p className="mt-1 text-slate-500">{product.name}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-xl bg-green-100 p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Thêm ảnh
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              {editingImage ? "Cập nhật ảnh" : "Tạo ảnh mới"}
            </h3>

            <AdminProductImageForm
              initialData={editingImage}
              onSubmit={handleSubmitForm}
              submitting={submitting}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-xl border border-slate-200 p-6">
              Đang tải ảnh sản phẩm...
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 p-6 text-slate-500">
              Chưa có ảnh nào.
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-square w-full bg-slate-100">
                  <img
                    src={image.imageUrl}
                    alt="product"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Sort: {image.sortOrder}
                    </span>

                    {image.isThumbnail ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Thumbnail
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Ảnh phụ
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm text-slate-500">
                    {image.imageUrl}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(image)}
                      className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(image.id)}
                      className="rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductImageManager;