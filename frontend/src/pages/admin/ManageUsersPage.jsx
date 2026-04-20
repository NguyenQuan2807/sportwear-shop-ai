import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminUserApi,
  getAdminUsersApi,
  updateAdminUserApi,
} from "../../services/adminUserService";

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

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách user";
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
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

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "emailVerified" ? value === "true" : value,
    }));
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
      handleCancelEdit();
      fetchUsers();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể cập nhật user";
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
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa user";
      setErrorMessage(backendMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản lý user</h1>
            <p className="mt-2 text-slate-500">
              Xem danh sách tài khoản, chỉnh sửa quyền, thông tin cơ bản và trạng thái xác thực email
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_220px_260px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Từ khóa</label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tìm theo họ tên, email, số điện thoại..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              name="roleName"
              value={filters.roleName}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {roleOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Xác thực email</label>
            <select
              name="emailVerified"
              value={filters.emailVerified}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {verificationOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-600">
            Tổng user: <span className="font-semibold text-slate-800">{filteredUsers.length}</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-xl bg-green-100 p-4 text-green-700 shadow">{successMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">{errorMessage}</div>
      ) : null}

      {editingUser ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-800">Cập nhật user #{editingUser.id}</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="text"
                value={editingUser.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                name="roleName"
                value={formData.roleName}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái xác thực</label>
              <select
                name="emailVerified"
                value={String(formData.emailVerified)}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Địa chỉ</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6 text-slate-500">Đang tải danh sách user...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-slate-500">Không có user nào phù hợp với bộ lọc hiện tại.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Xác thực</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-700">#{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="min-w-[260px]">
                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {user.phone || "Chưa có số điện thoại"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.roleName === "ADMIN"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {user.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.emailVerified == null ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          Legacy
                        </span>
                      ) : user.emailVerified ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                          Chưa xác thực
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
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
  );
};

export default ManageUsersPage;
