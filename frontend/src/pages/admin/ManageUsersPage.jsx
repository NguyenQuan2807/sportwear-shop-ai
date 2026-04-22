import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminUserApi,
  getAdminUsersApi,
  updateAdminUserApi,
} from "../../services/adminUserService";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminFilterLabel,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  adminTextareaClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

const PAGE_SIZE = 10;
const defaultFilters = { keyword: "", roleName: "", emailVerified: "" };
const roleOptions = [
  { value: "", label: "Tất cả role" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];
const verificationOptions = [
  { value: "", label: "Tất cả xác thực" },
  { value: "true", label: "Đã xác thực" },
  { value: "false", label: "Chưa xác thực" },
  { value: "legacy", label: "Legacy" },
];
const emptyForm = {
  id: null,
  fullName: "",
  phone: "",
  address: "",
  roleName: "USER",
  emailVerified: true,
};
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
const editBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:-translate-y-0.5 hover:bg-amber-100";
const deleteBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100";

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminUsersApi();
      setUsers(response.data || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tải danh sách user",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const keyword = filters.keyword.trim().toLowerCase();
        const matchesKeyword =
          !keyword ||
          user.fullName?.toLowerCase().includes(keyword) ||
          user.email?.toLowerCase().includes(keyword) ||
          user.phone?.toLowerCase().includes(keyword);
        const matchesRole =
          !filters.roleName || user.roleName === filters.roleName;
        const matchesVerification =
          !filters.emailVerified ||
          (filters.emailVerified === "legacy" && user.emailVerified == null) ||
          (filters.emailVerified === "true" && user.emailVerified === true) ||
          (filters.emailVerified === "false" && user.emailVerified === false);
        return matchesKeyword && matchesRole && matchesVerification;
      }),
    [users, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredUsers, currentPage],
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      roleName: user.roleName || "USER",
      emailVerified: user.emailVerified ?? true,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      await updateAdminUserApi(editingUser.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        roleName: formData.roleName,
        emailVerified: formData.emailVerified,
      });
      setSuccessMessage("Cập nhật user thành công");
      setEditingUser(null);
      setFormData(emptyForm);
      fetchUsers();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể cập nhật user",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user ${user.email}?`)) return;
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminUserApi(user.id);
      setSuccessMessage("Xóa user thành công");
      fetchUsers();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Không thể xóa user");
    }
  };

  const start =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý người dùng"
        breadcrumbs={["Admin", "Người dùng"]}
      />
      {successMessage ? (
        <AdminAlert type="success">{successMessage}</AdminAlert>
      ) : null}
      {errorMessage ? (
        <AdminAlert type="error">{errorMessage}</AdminAlert>
      ) : null}
      {editingUser ? (
        <AdminCard title={`Cập nhật user #${editingUser.id}`}>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <div>
              <AdminFilterLabel>Họ tên</AdminFilterLabel>
              <input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fullName: e.target.value }))
                }
                className={adminInputClassName}
                required
              />
            </div>
            <div>
              <AdminFilterLabel>Email</AdminFilterLabel>
              <input
                value={editingUser.email}
                disabled
                className={`${adminInputClassName} bg-slate-100 text-slate-500`}
              />
            </div>
            <div>
              <AdminFilterLabel>Số điện thoại</AdminFilterLabel>
              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                className={adminInputClassName}
              />
            </div>
            <div>
              <AdminFilterLabel>Role</AdminFilterLabel>
              <select
                value={formData.roleName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, roleName: e.target.value }))
                }
                className={adminInputClassName}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <AdminFilterLabel>Xác thực</AdminFilterLabel>
              <select
                value={String(formData.emailVerified)}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    emailVerified: e.target.value === "true",
                  }))
                }
                className={adminInputClassName}
              >
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <AdminFilterLabel>Địa chỉ</AdminFilterLabel>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, address: e.target.value }))
                }
                className={adminTextareaClassName}
              />
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <AdminButton type="submit" variant="brand" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </AdminButton>
              <AdminButton
                type="button"
                variant="light"
                onClick={() => {
                  setEditingUser(null);
                  setFormData(emptyForm);
                }}
              >
                Hủy
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}
      <AdminCard>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon className="h-5 w-5" />
              </span>
              <input
                name="keyword"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, keyword: e.target.value }))
                }
                placeholder="Tìm kiếm người dùng..."
                className={`${adminInputClassName} pl-12`}
              />
            </div>
            <select
              value={filters.roleName}
              onChange={(e) =>
                setFilters((p) => ({ ...p, roleName: e.target.value }))
              }
              className={adminInputClassName}
            >
              {roleOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filters.emailVerified}
              onChange={(e) =>
                setFilters((p) => ({ ...p, emailVerified: e.target.value }))
              }
              className={adminInputClassName}
            >
              {verificationOptions.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">
              Đang tải danh sách user...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-sm text-slate-500">Không có user phù hợp.</div>
          ) : (
            <>
              <AdminTableShell>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <thead className="border-b border-slate-200 bg-white text-left text-slate-500">
                      <tr>
                        <th className="w-[18%] px-4 py-3 font-semibold">
                          Người dùng
                        </th>
                        <th className="w-[24%] px-4 py-3 font-semibold">
                          Email
                        </th>
                        <th className="w-[14%] px-4 py-3 font-semibold">SĐT</th>
                        <th className="w-[10%] px-4 py-3 font-semibold">
                          Role
                        </th>
                        <th className="w-[12%] px-4 py-3 font-semibold">
                          Xác thực
                        </th>
                        <th className="w-[14%] px-4 py-3 font-semibold">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 bg-white">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">
                              {user.fullName || "Chưa cập nhật"}
                            </p>
                            <p className="text-xs text-slate-500">#{user.id}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {user.phone || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={statusPillClassName(
                                user.roleName === "ADMIN"
                                  ? "violet"
                                  : "neutral",
                              )}
                            >
                              {user.roleName}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={statusPillClassName(
                                user.emailVerified === true
                                  ? "success"
                                  : user.emailVerified === false
                                    ? "warning"
                                    : "neutral",
                              )}
                            >
                              {user.emailVerified === true
                                ? "Đã xác thực"
                                : user.emailVerified === false
                                  ? "Chưa xác thực"
                                  : "Legacy"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDateTime(user.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                title="Sửa user"
                                className={editBtn}
                                onClick={() => handleEditClick(user)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                title="Xóa user"
                                className={deleteBtn}
                                onClick={() => handleDelete(user)}
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
                total={filteredUsers.length}
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
