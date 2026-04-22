import { useEffect, useMemo, useState } from "react";
import {
  createAdminProductVariantApi,
  deleteAdminProductVariantApi,
  getAdminProductVariantsApi,
  updateAdminProductVariantApi,
} from "../../services/adminProductVariantService";
import AdminProductVariantForm from "./AdminProductVariantForm";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminMetricCard,
  AdminTableShell,
  adminInputClassName,
} from "../admin/AdminShell";

const normalizeText = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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
      setErrorMessage(error?.response?.data?.message || "Không thể tải danh sách biến thể");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) fetchVariants();
  }, [product]);

  const filteredVariants = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    if (!keyword) return variants;
    return variants.filter((variant) => [variant.id, variant.size, variant.color, variant.price, variant.stockQuantity, variant.sku].some((value) => normalizeText(value).includes(keyword)));
  }, [variants, searchTerm]);

  const groupedVariants = useMemo(() => {
    const groups = new Map();
    filteredVariants.forEach((variant) => {
      const color = String(variant.color || "").trim() || "Không rõ màu";
      if (!groups.has(color)) groups.set(color, []);
      groups.get(color).push(variant);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "vi"));
  }, [filteredVariants]);

  const totalStock = useMemo(() => filteredVariants.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0), [filteredVariants]);

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
    if (!window.confirm("Bạn có chắc muốn xóa biến thể này?")) return;
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminProductVariantApi(variantId);
      setSuccessMessage("Xóa biến thể thành công");
      fetchVariants();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa biến thể");
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
      setErrorMessage(error?.response?.data?.message || "Không thể lưu biến thể");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200/70 bg-[#F5F7FB] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-[32px] border-b border-slate-200/70 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Quản lý biến thể sản phẩm</h2>
            <p className="mt-1 text-sm text-slate-500">{product.name}</p>
          </div>
          <AdminButton type="button" variant="light" onClick={onClose}>Đóng</AdminButton>
        </div>

        <div className="space-y-6 p-6">
          {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
          {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <AdminMetricCard label="Biến thể đang hiển thị" value={filteredVariants.length} helper="Sau khi áp dụng tìm kiếm" tone="brand" />
            <AdminMetricCard label="Màu sắc" value={groupedVariants.length} helper="Số nhóm màu hiện có" tone="violet" />
            <AdminMetricCard label="Tổng tồn kho" value={totalStock} helper="Tổng số lượng còn lại" tone="emerald" />
          </div>

          <AdminCard title="Bộ lọc biến thể" description="Tìm theo màu, size, SKU, tồn kho hoặc giá." action={<AdminButton type="button" variant="brand" onClick={handleCreateClick}>Thêm biến thể</AdminButton>}>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Ví dụ: Đỏ, M, SKU001..." className={adminInputClassName} />
          </AdminCard>

          {showForm ? (
            <AdminCard title={editingVariant ? "Cập nhật biến thể" : "Tạo biến thể mới"}>
              <AdminProductVariantForm initialData={editingVariant} onSubmit={handleSubmitForm} submitting={submitting} onCancel={() => { setEditingVariant(null); setShowForm(false); }} />
            </AdminCard>
          ) : null}

          {loading ? (
            <AdminCard><div className="text-sm text-slate-500">Đang tải biến thể...</div></AdminCard>
          ) : groupedVariants.length === 0 ? (
            <AdminCard><div className="text-sm text-slate-500">Không có biến thể nào phù hợp.</div></AdminCard>
          ) : (
            <div className="space-y-6">
              {groupedVariants.map(([color, items]) => (
                <AdminCard key={color} title={color} description={`${items.length} biến thể • Tổng tồn kho ${items.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)}`}>
                  <AdminTableShell>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                          <tr>
                            <th className="px-5 py-4 font-semibold">ID</th>
                            <th className="px-5 py-4 font-semibold">Size</th>
                            <th className="px-5 py-4 font-semibold">Màu</th>
                            <th className="px-5 py-4 font-semibold">Giá</th>
                            <th className="px-5 py-4 font-semibold">Tồn kho</th>
                            <th className="px-5 py-4 font-semibold">SKU</th>
                            <th className="px-5 py-4 font-semibold">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 bg-white">
                          {items.map((variant) => (
                            <tr key={variant.id} className="hover:bg-slate-50/70">
                              <td className="px-5 py-4 text-slate-500">#{variant.id}</td>
                              <td className="px-5 py-4 font-semibold text-slate-900">{variant.size}</td>
                              <td className="px-5 py-4 text-slate-700">{variant.color}</td>
                              <td className="px-5 py-4 text-slate-700">{formatCurrency(variant.price)}</td>
                              <td className="px-5 py-4 text-slate-700">{variant.stockQuantity}</td>
                              <td className="px-5 py-4 text-slate-500">{variant.sku}</td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <AdminButton type="button" variant="warning" className="px-4 py-2 text-xs" onClick={() => handleEditClick(variant)}>Sửa</AdminButton>
                                  <AdminButton type="button" variant="danger" className="px-4 py-2 text-xs" onClick={() => handleDelete(variant.id)}>Xóa</AdminButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AdminTableShell>
                </AdminCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductVariantManager;
