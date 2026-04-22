import { useEffect, useMemo, useState } from "react";
import useVietnamLocations from "../../hooks/useVietnamLocations";

const defaultForm = {
  id: null,
  fullName: "",
  phoneNumber: "",
  addressLine: "",
  provinceCode: "",
  provinceName: "",
  districtCode: "",
  districtName: "",
  wardCode: "",
  wardName: "",
  isDefault: false,
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

const AddressModal = ({ open, onClose, onSubmit, initialData }) => {
  const { provinces, isLoading, error, getDistrictsByProvinceCode, getWardsByDistrictCode } = useVietnamLocations();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) return;
    setForm(initialData ? { ...defaultForm, ...initialData } : defaultForm);
  }, [open, initialData]);

  const districtOptions = useMemo(
    () => getDistrictsByProvinceCode(form.provinceCode),
    [form.provinceCode, getDistrictsByProvinceCode]
  );

  const wardOptions = useMemo(
    () => getWardsByDistrictCode(form.provinceCode, form.districtCode),
    [form.provinceCode, form.districtCode, getWardsByDistrictCode]
  );

  const handleProvinceChange = (value) => {
    const province = provinces.find((item) => item.code === value);
    setForm((prev) => ({
      ...prev,
      provinceCode: value,
      provinceName: province?.name || "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (value) => {
    const district = districtOptions.find((item) => item.code === value);
    setForm((prev) => ({
      ...prev,
      districtCode: value,
      districtName: district?.name || "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (value) => {
    const ward = wardOptions.find((item) => item.code === value);
    setForm((prev) => ({
      ...prev,
      wardCode: value,
      wardName: ward?.name || "",
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.phoneNumber.trim() ||
      !form.addressLine.trim() ||
      !form.provinceCode ||
      !form.districtCode ||
      !form.wardCode
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const payload = {
    ...form,
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    addressLine: form.addressLine.trim(),
    };

    if (!form.id) {
    delete payload.id;
    }

    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="relative w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
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
            {initialData ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          </h2>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-600">
            Đang tải dữ liệu tỉnh/thành, huyện, xã...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-600">
            {error}
          </div>
        ) : (
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
                label="Số điện thoại"
                value={form.phoneNumber}
                onChange={(value) => handleChange("phoneNumber", value)}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <Field
              label="Địa chỉ chi tiết"
              value={form.addressLine}
              onChange={(value) => handleChange("addressLine", value)}
              placeholder="Ví dụ: số nhà, tên đường..."
              required
            />

            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                label="Tỉnh/Thành phố"
                value={form.provinceCode}
                onChange={handleProvinceChange}
                options={provinces}
                placeholder="Chọn tỉnh/thành"
                required
              />

              <SelectField
                label="Huyện"
                value={form.districtCode}
                onChange={handleDistrictChange}
                options={districtOptions}
                placeholder="Chọn huyện"
                disabled={!form.provinceCode}
                required
              />

              <SelectField
                label="Xã/Phường"
                value={form.wardCode}
                onChange={handleWardChange}
                options={wardOptions}
                placeholder="Chọn xã/phường"
                disabled={!form.districtCode}
                required
              />
            </div>

            <label className="flex items-center gap-3 pt-1 text-[15px] text-neutral-700">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300"
              />
              Đặt làm địa chỉ mặc định
            </label>

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
                className="rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {initialData ? "Lưu thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">
      {label}
      {required ? " *" : ""}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-14 w-full rounded-[10px] border border-neutral-300 px-4 text-[15px] outline-none transition focus:border-black"
    />
  </label>
);

const SelectField = ({ label, value, onChange, options, placeholder, disabled = false, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">
      {label}
      {required ? " *" : ""}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-14 w-full rounded-[10px] border border-neutral-300 bg-white px-4 text-[15px] outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-neutral-100"
    >
      <option value="">{placeholder}</option>
      {options.map((item) => (
        <option key={item.code} value={item.code}>
          {item.name}
        </option>
      ))}
    </select>
  </label>
);

export default AddressModal;
