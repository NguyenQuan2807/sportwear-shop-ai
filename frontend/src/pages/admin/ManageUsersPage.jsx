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
  AdminMetricCard,
  AdminPageHeader,
  AdminTableShell,
  adminInputClassName,
  adminTextareaClassName,
  statusPillClassName,
} from "../../components/admin/AdminShell";

const defaultFilters = {
  keyword: "",
  roleName: "",
  emailVerified: "",
};

const roleOptions = [
  { value: "", label: "Tất cả role" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

const verificationOptions = [
  { value: "", label: "Tất cả trạng thái xác thực" },
  { value: "true", label: "Đã xác thực" },
  { value: "false", label: "Chưa xác thực" },
  { value: "legacy", label: "Tài khoản cũ" },
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
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminUsersApi();
      setUsers(response.data || []);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải danh sách user";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        user.fullName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);

      const matchesRole = !filters.roleName || user.roleName === filters.roleName;
      const matchesVerification =
        !filters.emailVerified ||
        (filters.emailVerified === "legacy" && user.emailVerified == null) ||
        (filters.emailVerified === "true" && user.emailVerified === true) ||
        (filters.emailVerified === "false" && user.emailVerified === false);

      return matchesKeyword && matchesRole && matchesVerification;
    });
  }, [users, filters]);

  const adminCount = useMemo(() => users.filter((user) => user.roleName === "ADMIN").length, [users]);
  const verifiedCount = useMemo(() => users.filter((user) => user.emailVerified === true).length, [users]);
  const legacyCount = useMemo(() => users.filter((user) => user.emailVerified == null).length, [users]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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
    setErrorMessage("");
    setSuccessMessage("");
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
      const backendMessage = error?.response?.data?.message || "Không thể cập nhật user";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa user ${user.email}?`);
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminUserApi(user.id);
      setSuccessMessage("Xóa user thành công");
      fetchUsers();
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể xóa user";
      setErrorMessage(backendMessage);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Đồng bộ trang user theo giao diện admin mới, tập trung vào bảng dữ liệu, bộ lọc và form chỉnh sửa nhanh tài khoản."
        breadcrumbs={["Admin", "Users", "Người dùng"]}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Tổng người dùng" value={users.length} helper="Toàn bộ tài khoản trong hệ thống" tone="brand" icon={<UsersIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Tài khoản admin" value={adminCount} helper="Tài khoản có quyền quản trị" tone="violet" icon={<ShieldIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Đã xác thực email" value={verifiedCount} helper="Tài khoản xác thực thành công" tone="emerald" icon={<MailCheckIcon className="h-5 w-5" />} />
        <AdminMetricCard label="Legacy account" value={legacyCount} helper="Tài khoản cũ chưa có cờ xác thực" tone="amber" icon={<ClockIcon className="h-5 w-5" />} />
      </div>

      <AdminCard title="Bộ lọc người dùng" description="Lọc theo từ khóa, quyền và trạng thái xác thực email để quản lý nhanh hơn.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_220px_260px]">
          <div>
            <AdminFilterLabel>Từ khóa</AdminFilterLabel>
            <input type="text" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Tìm theo họ tên, email, số điện thoại..." className={adminInputClassName} />
          </div>
          <div>
            <AdminFilterLabel>Role</AdminFilterLabel>
            <select name="roleName" value={filters.roleName} onChange={handleFilterChange} className={adminInputClassName}>
              {roleOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <AdminFilterLabel>Xác thực email</AdminFilterLabel>
            <select name="emailVerified" value={filters.emailVerified} onChange={handleFilterChange} className={adminInputClassName}>
              {verificationOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div>Tổng user phù hợp: <span className="font-semibold text-slate-900">{filteredUsers.length}</span></div>
          <AdminButton variant="light" className="px-4 py-2.5" onClick={() => setFilters(defaultFilters)}>Xóa bộ lọc</AdminButton>
        </div>
      </AdminCard>

      {successMessage ? <AdminAlert type="success">{successMessage}</AdminAlert> : null}
      {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

      {editingUser ? (
        <AdminCard title={`Cập nhật user #${editingUser.id}`} description="Giữ nguyên logic chỉnh sửa user hiện tại, chỉ đồng bộ lại form theo style admin mới.">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <AdminFilterLabel>Họ tên</AdminFilterLabel>
              <input type="text" name="fullName" value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} className={adminInputClassName} required />
            </div>
            <div>
              <AdminFilterLabel>Email</AdminFilterLabel>
              <input type="text" value={editingUser.email} disabled className={`${adminInputClassName} bg-slate-100 text-slate-500`} />
            </div>
            <div>
              <AdminFilterLabel>Số điện thoại</AdminFilterLabel>
              <input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} className={adminInputClassName} />
            </div>
            <div>
              <AdminFilterLabel>Role</AdminFilterLabel>
              <select name="roleName" value={formData.roleName} onChange={(e) => setFormData((prev) => ({ ...prev, roleName: e.target.value }))} className={adminInputClassName}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <AdminFilterLabel>Trạng thái xác thực</AdminFilterLabel>
              <select name="emailVerified" value={String(formData.emailVerified)} onChange={(e) => setFormData((prev) => ({ ...prev, emailVerified: e.target.value === "true" }))} className={adminInputClassName}>
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <AdminFilterLabel>Địa chỉ</AdminFilterLabel>
              <textarea name="address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} className={adminTextareaClassName} />
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <AdminButton type="submit" variant="brand" disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</AdminButton>
              <AdminButton type="button" variant="light" onClick={() => { setEditingUser(null); setFormData(emptyForm); }}>Hủy</AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminCard title="Danh sách người dùng" description="Xem nhanh user, role, trạng thái xác thực và thao tác chỉnh sửa / xóa ngay tại bảng.">
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải danh sách user...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-sm text-slate-500">Không có user nào phù hợp với bộ lọc hiện tại.</div>
        ) : (
          <AdminTableShell>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Người dùng</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Xác thực</th>
                    <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                    <th className="px-5 py-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800">#{user.id}</td>
                      <td className="px-5 py-4">
                        <div className="min-w-[280px]">
                          <p className="font-semibold text-slate-900">{user.fullName}</p>
                          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                          <p className="mt-1 text-xs text-slate-500">{user.phone || "Chưa có số điện thoại"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={statusPillClassName(user.roleName === "ADMIN" ? "violet" : "neutral")}>{user.roleName}</span>
                      </td>
                      <td className="px-5 py-4">
                        {user.emailVerified == null ? (
                          <span className={statusPillClassName("warning")}>Legacy</span>
                        ) : user.emailVerified ? (
                          <span className={statusPillClassName("success")}>Đã xác thực</span>
                        ) : (
                          <span className={statusPillClassName("danger")}>Chưa xác thực</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDateTime(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <AdminButton variant="warning" className="px-3 py-2 text-xs" onClick={() => handleEditClick(user)}>Sửa</AdminButton>
                          <AdminButton variant="danger" className="px-3 py-2 text-xs" onClick={() => handleDelete(user)}>Xóa</AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableShell>
        )}
      </AdminCard>
    </div>
  );
};

function iconProps(className) { return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", className }; }
function UsersIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="8" r="3.5" /><path d="M20 21v-1a4 4 0 0 0-3-3.87" /><path d="M16.5 4.13a3.5 3.5 0 0 1 0 7.74" /></svg>; }
function ShieldIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" /><path d="m9.5 12 1.8 1.8 3.7-3.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MailCheckIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" /><path d="m9 17 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon({ className = "h-5 w-5" }) { return <svg {...iconProps(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default ManageUsersPage;
