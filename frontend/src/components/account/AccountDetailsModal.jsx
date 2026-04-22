import { useEffect, useState } from "react";

const defaultForm = {
  fullName: "",
  email: "",
  dateOfBirth: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

const AccountDetailsModal = ({ open, onClose, onSubmit, initialData, submitting = false }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) return;
    setForm({
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [open, initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      alert("Vui lòng nhập họ và tên.");
      return;
    }

    const wantsChangePassword = Boolean(form.currentPassword || form.newPassword || form.confirmPassword);

    if (wantsChangePassword) {
      if (!form.currentPassword) {
        alert("Vui lòng nhập mật khẩu hiện tại.");
        return;
      }

      if (form.newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        alert("Xác nhận mật khẩu không khớp.");
        return;
      }
    }

    onSubmit({
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth || null,
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="relative w-full max-w-[680px] rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
          aria-label="Đóng"
        >
          <CloseIcon />
        </button>

        <div className="mb-8 pr-14">
          <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-neutral-900">
            Sửa chi tiết tài khoản
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Cập nhật họ tên, ngày sinh và đổi mật khẩu. Email hiện tại được giữ nguyên để tránh ảnh hưởng phiên đăng nhập.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Họ và tên"
              value={form.fullName}
              onChange={(value) => handleChange("fullName", value)}
              placeholder="Nhập họ và tên"
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={() => {}}
              placeholder="Email"
              disabled
            />
          </div>

          <Field
            label="Ngày sinh"
            type="date"
            value={form.dateOfBirth || ""}
            onChange={(value) => handleChange("dateOfBirth", value)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mật khẩu hiện tại"
              type="password"
              value={form.currentPassword}
              onChange={(value) => handleChange("currentPassword", value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
            <Field
              label="Mật khẩu mới"
              type="password"
              value={form.newPassword}
              onChange={(value) => handleChange("newPassword", value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <Field
            label="Xác nhận mật khẩu mới"
            type="password"
            value={form.confirmPassword}
            onChange={(value) => handleChange("confirmPassword", value)}
            placeholder="Nhập lại mật khẩu mới"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, required = false, disabled = false }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">
      {label}
      {required ? " *" : ""}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-14 w-full rounded-[10px] border border-neutral-300 px-4 text-[15px] outline-none transition focus:border-black disabled:bg-neutral-100"
    />
  </label>
);

export default AccountDetailsModal;
