import { useEffect, useMemo, useState } from "react";
import {
  createAdminProductVariantApi,
  deleteAdminProductVariantApi,
  getAdminProductVariantsApi,
  updateAdminProductVariantApi,
} from "../../services/adminProductVariantService";
import AdminProductVariantForm from "./AdminProductVariantForm";
import { formatCurrency } from "../../utils/formatCurrency";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const sortVariants = (items) => {
  return [...items].sort((a, b) => {
    const colorCompare = String(a.color || "").localeCompare(String(b.color || ""), "vi");
    if (colorCompare !== 0) return colorCompare;

    const indexA = sizeOrder.indexOf(String(a.size || "").toUpperCase());
    const indexB = sizeOrder.indexOf(String(b.size || "").toUpperCase());

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return String(a.size || "").localeCompare(String(b.size || ""), "vi");
  });
};

const AdminProductVariantManager = ({ product, onClose }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingVariant, setEditingVariant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminProductVariantsApi(product.id);
      setVariants(sortVariants(response.data || []));
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

  const filteredVariants = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return variants;

    return variants.filter((variant) =>
      [variant.id, variant.size, variant.color, variant.price, variant.stockQuantity, variant.sku]
        .some((value) => normalizeText(value).includes(keyword))
    );
  }, [variants, searchTerm]);

  const groupedVariants = useMemo(() => {
    const groups = new Map();

    filteredVariants.forEach((variant) => {
      const color = String(variant.color || "").trim() || "Không rõ màu";

      if (!groups.has(color)) {
        groups.set(color, []);
      }

      groups.get(color).push(variant);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "vi"));
  }, [filteredVariants]);

  const totalStock = useMemo(() => {
    return filteredVariants.reduce(
      (sum, item) => sum + Number(item.stockQuantity || 0),
      0
    );
  }, [filteredVariants]);

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
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Quản lý biến thể sản phẩm
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
                  Tìm nhanh biến thể
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tìm theo màu, size, SKU, tồn kho hoặc giá
                </p>
              </div>

              <button
                onClick={handleCreateClick}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Thêm biến thể
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ví dụ: Đỏ, M, SKU001..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 border border-slate-200">
                {filteredVariants.length} biến thể
              </div>

              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 border border-slate-200">
                {groupedVariants.length} màu
              </div>

              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 border border-slate-200">
                Tồn kho: {totalStock}
              </div>
            </div>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
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

          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow">
              Đang tải biến thể...
            </div>
          ) : groupedVariants.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow">
              Không có biến thể nào phù hợp.
            </div>
          ) : (
            <div className="space-y-6">
              {groupedVariants.map(([color, items]) => (
                <div
                  key={color}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{color}</h3>
                      <p className="text-sm text-slate-500">
                        {items.length} biến thể • Tổng tồn kho{" "}
                        {items.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-100 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Màu</th>
                          <th className="px-4 py-3">Giá</th>
                          <th className="px-4 py-3">Tồn kho</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Hành động</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((variant) => (
                          <tr key={variant.id} className="border-t border-slate-200">
                            <td className="px-4 py-3">#{variant.id}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {variant.size}
                            </td>
                            <td className="px-4 py-3">{variant.color}</td>
                            <td className="px-4 py-3">
                              {formatCurrency(variant.price)}
                            </td>
                            <td className="px-4 py-3">{variant.stockQuantity}</td>
                            <td className="px-4 py-3">{variant.sku}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductVariantManager;