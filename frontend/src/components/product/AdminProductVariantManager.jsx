import { useEffect, useState } from "react";
import {
  createAdminProductVariantApi,
  deleteAdminProductVariantApi,
  getAdminProductVariantsApi,
  updateAdminProductVariantApi,
} from "../../services/adminProductVariantService";
import AdminProductVariantForm from "./AdminProductVariantForm";
import { formatCurrency } from "../../utils/formatCurrency";

const AdminProductVariantManager = ({ product, onClose }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingVariant, setEditingVariant] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminProductVariantsApi(product.id);
      setVariants(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách biến thể";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchVariants();
    }
  }, [product]);

  const handleCreateClick = () => {
    setEditingVariant(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = (variant) => {
    setEditingVariant(variant);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDelete = async (variantId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa biến thể này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminProductVariantApi(variantId);
      setSuccessMessage("Xóa biến thể thành công");
      fetchVariants();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa biến thể";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingVariant) {
        await updateAdminProductVariantApi(editingVariant.id, formData);
        setSuccessMessage("Cập nhật biến thể thành công");
      } else {
        await createAdminProductVariantApi(product.id, formData);
        setSuccessMessage("Tạo biến thể thành công");
      }

      setShowForm(false);
      setEditingVariant(null);
      fetchVariants();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu biến thể";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setEditingVariant(null);
    setShowForm(false);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Quản lý biến thể sản phẩm
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
            Thêm biến thể
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              {editingVariant ? "Cập nhật biến thể" : "Tạo biến thể mới"}
            </h3>

            <AdminProductVariantForm
              initialData={editingVariant}
              onSubmit={handleSubmitForm}
              submitting={submitting}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6">Đang tải biến thể...</div>
          ) : variants.length === 0 ? (
            <div className="p-6 text-slate-500">Chưa có biến thể nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Màu</th>
                    <th className="px-4 py-3 text-left">Giá</th>
                    <th className="px-4 py-3 text-left">Tồn kho</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{variant.id}</td>
                      <td className="px-4 py-3">{variant.size}</td>
                      <td className="px-4 py-3">{variant.color}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {formatCurrency(variant.price)}
                      </td>
                      <td className="px-4 py-3">{variant.stockQuantity}</td>
                      <td className="px-4 py-3">{variant.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(variant)}
                            className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(variant.id)}
                            className="rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductVariantManager;