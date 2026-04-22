import { useEffect, useMemo, useState } from "react";
import {
  createAdminSportApi,
  deleteAdminSportApi,
  getAdminSportDetailApi,
  getAdminSportsApi,
  updateAdminSportApi,
} from "../../services/adminSportService";
import AdminSportForm from "../../components/common/AdminSportForm";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";
const PAGE_SIZE = 10;
const editBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:-translate-y-0.5 hover:bg-amber-100";
const deleteBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100";
const normalizeText = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
export default function ManageSportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fetchItems = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getAdminSportsApi();
      setItems(res.data || []);
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message || "Không thể tải danh sách môn thể thao",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const filtered = useMemo(() => {
    const k = normalizeText(searchTerm);
    if (!k) return items;
    return items.filter((item) =>
      [
        item.id,
        item.name,
        item.slug,
        item.description,
        item.productCount,
        item.isActive ? "hoat dong" : "an",
      ].some((v) => normalizeText(v).includes(k)),
    );
  }, [items, searchTerm]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const handleEditClick = async (id) => {
    try {
      const res = await getAdminSportDetailApi(id);
      setEditingItem(res.data);
      setShowForm(true);
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message || "Không thể tải chi tiết môn thể thao",
      );
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa môn thể thao này?")) return;
    try {
      await deleteAdminSportApi(id);
      setSuccessMessage("Xóa môn thể thao thành công");
      fetchItems();
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message || "Không thể xóa môn thể thao",
      );
    }
  };
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingItem) {
        await updateAdminSportApi(editingItem.id, formData);
        setSuccessMessage("Cập nhật môn thể thao thành công");
      } else {
        await createAdminSportApi(formData);
        setSuccessMessage("Tạo môn thể thao thành công");
      }
      setShowForm(false);
      setEditingItem(null);
      fetchItems();
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message || "Không thể lưu môn thể thao",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const start = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý môn thể thao"
        breadcrumbs={["Admin", "Môn thể thao"]}
        action={
          <AdminButton
            variant="brand"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            Thêm môn thể thao
          </AdminButton>
        }
      />
      {successMessage ? (
        <AdminAlert type="success">{successMessage}</AdminAlert>
      ) : null}
      {errorMessage ? (
        <AdminAlert type="error">{errorMessage}</AdminAlert>
      ) : null}
      {showForm ? (
        <AdminCard
          title={editingItem ? "Cập nhật môn thể thao" : "Tạo môn thể thao mới"}
        >
          <AdminSportForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            submitting={submitting}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </AdminCard>
      ) : null}
      <AdminCard>
        <div className="space-y-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm môn thể thao..."
              className={`${adminInputClassName} pl-12`}
            />
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">
              Đang tải môn thể thao...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-slate-500">
              Không có môn thể thao phù hợp.
            </div>
          ) : (
            <>
              <AdminTableShell>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <thead className="border-b border-slate-200 bg-white text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          Môn thể thao
                        </th>
                        <th className="w-[18%] px-4 py-3 font-semibold">
                          Slug
                        </th>
                        <th className="w-[10%] px-4 py-3 font-semibold">
                          Sản phẩm
                        </th>
                        <th className="w-[26%] px-4 py-3 font-semibold">
                          Mô tả
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {paginated.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                {item.imageUrl ? (
                                  <img
                                    src={resolveImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    className="h-12 w-12 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center text-[10px] text-slate-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  #{item.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {item.slug}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.productCount || 0}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <div
                              className="max-w-[320px] truncate"
                              title={item.description}
                            >
                              {item.description || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={statusPillClassName(
                                item.isActive ? "success" : "danger",
                              )}
                            >
                              {item.isActive ? "Đang bật" : "Đang ẩn"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                title="Sửa môn thể thao"
                                className={editBtn}
                                onClick={() => handleEditClick(item.id)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                title="Xóa môn thể thao"
                                className={deleteBtn}
                                onClick={() => handleDelete(item.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminTableShell>
              <PaginationBar
                start={start}
                end={end}
                total={filtered.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m12 6 4 4" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
      <path d="M6 7l1 12h10l1-12M9 7V4h6v3" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronLeftIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PaginationBar({
  start,
  end,
  total,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <span>
        Hiển thị {start}-{end} trên {total} dữ liệu
      </span>
      <div className="flex items-center gap-2 self-end md:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${currentPage === page ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
