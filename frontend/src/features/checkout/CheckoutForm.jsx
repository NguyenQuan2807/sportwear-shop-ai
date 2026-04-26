import { useMemo } from "react";
import { Link } from "react-router-dom";
import useVietnamLocations from "../../hooks/useVietnamLocations";
import AddressPickerModal from "./AddressPickerModal";

const InputField = ({ label, name, value, onChange, placeholder, required = false, helperText, type = "text", readOnly = false }) => (
  <div>
    {label ? <label className="mb-2 block text-sm font-medium text-black/55">{label}</label> : null}
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} readOnly={readOnly} className="h-14 w-full rounded-xl border border-black/20 bg-white px-4 text-[17px] text-black outline-none transition focus:border-black read-only:bg-black/[0.03]" />
    {helperText ? <p className="mt-2 text-sm text-black/45">{helperText}</p> : null}
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, disabled = false, required = false }) => (
  <div>
    {label ? <label className="mb-2 block text-sm font-medium text-black/55">{label}</label> : null}
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} required={required} className="h-14 w-full rounded-xl border border-black/20 bg-white px-4 text-[17px] text-black outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03]">
      <option value="">{placeholder}</option>
      {options.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
    </select>
  </div>
);

const CheckoutForm = ({ formData, submitting, addresses, selectedAddressId, isAddressModalOpen, onChange, onSelectPayment, onOpenAddressModal, onCloseAddressModal, onChooseAddress, onProvinceChange, onDistrictChange, onWardChange, onToggleSaveAddress, onSubmit }) => {
  const { provinces, isLoading: locationsLoading } = useVietnamLocations();
  const districtOptions = useMemo(() => provinces.find((item) => item.code === formData.provinceCode)?.districts || [], [provinces, formData.provinceCode]);
  const wardOptions = useMemo(() => districtOptions.find((item) => item.code === formData.districtCode)?.wards || [], [districtOptions, formData.districtCode]);

  return (
    <>
      <form noValidate onSubmit={(event) => onSubmit(event, provinces)} className="space-y-10">
        <section className="border-b border-black/10 pb-10">
          <h2 className="text-[32px] font-semibold tracking-tight text-black">Giao hàng</h2>
          <div className="mt-7 space-y-6">
            <InputField label="Email *" name="email" value={formData.email} onChange={onChange} placeholder="Nhập email" required type="email" readOnly helperText="Email được tự động lấy từ tài khoản đang đăng nhập." />
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[28px] font-medium tracking-tight text-black">Thông tin người nhận và địa chỉ giao hàng</p>
                <button type="button" onClick={onOpenAddressModal} className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-sm font-semibold text-black transition hover:border-black">Chọn địa chỉ</button>
              </div>
              {selectedAddressId ? <p className="mb-4 text-sm text-black/55"></p> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Tên *" name="firstName" value={formData.firstName} onChange={onChange} placeholder="Tên của bạn" required />
                <InputField label="Họ *" name="lastName" value={formData.lastName} onChange={onChange} placeholder="Họ của bạn" required />
              </div>
            </div>
            <InputField label="Địa chỉ cụ thể *" name="addressLine" value={formData.addressLine} onChange={onChange} placeholder="Ví dụ: số nhà, tên đường..." required />
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField label="Tỉnh/Thành phố *" value={formData.provinceCode} onChange={onProvinceChange} options={provinces} placeholder={locationsLoading ? "Đang tải..." : "Chọn tỉnh/thành"} disabled={locationsLoading} required />
              <SelectField label="Quận/Huyện *" value={formData.districtCode} onChange={onDistrictChange} options={districtOptions} placeholder="Chọn quận/huyện" disabled={locationsLoading || !formData.provinceCode} required />
              <SelectField label="Phường/Xã *" value={formData.wardCode} onChange={onWardChange} options={wardOptions} placeholder="Chọn phường/xã" disabled={locationsLoading || !formData.districtCode} required />
            </div>
            <InputField label="Số điện thoại *" name="receiverPhone" value={formData.receiverPhone} onChange={onChange} placeholder="Số điện thoại nhận hàng" required helperText="Người vận chuyển có thể liên hệ với bạn để xác nhận việc giao hàng." />
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 text-sm text-black/75">
              <input type="checkbox" checked={formData.saveNewAddress} onChange={onToggleSaveAddress} className="h-4 w-4 rounded border-black/20" />
              Lưu địa chỉ này vào danh sách địa chỉ giao hàng của tôi
            </label>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-[32px] font-semibold tracking-tight text-black">Phương thức thanh toán</h2>
          <div className="space-y-4">
            <button type="button" onClick={() => onSelectPayment("COD")} className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-5 text-left transition ${formData.paymentMethod === "COD" ? "border-black shadow-[inset_0_0_0_1px_#000]" : "border-black/15 hover:border-black/35"}`}>
              <div className="min-w-0 flex-1"><div className="text-xl font-semibold text-black">Thanh toán khi nhận hàng (COD)</div><div className="mt-1 text-sm text-black/55">Thanh toán bằng tiền mặt khi đơn hàng được giao đến bạn.</div></div>
            </button>
            <button type="button" onClick={() => onSelectPayment("BANK_QR")} className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-5 text-left transition ${formData.paymentMethod === "BANK_QR" ? "border-black shadow-[inset_0_0_0_1px_#000]" : "border-black/15 hover:border-black/35"}`}>
              <div className="min-w-0 flex-1"><div className="text-xl font-semibold text-black">Chuyển khoản QR ngân hàng</div><div className="mt-1 text-sm text-black/55">Nhấn xác nhận để mở modal QR. Mã chỉ có hiệu lực trong 1 phút, nếu hết hạn thì thanh toán thất bại và đơn hàng sẽ không được tạo.</div></div>
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}</button>
            <Link to="/cart" className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-4 text-base font-semibold text-black transition hover:border-black">Quay lại giỏ hàng</Link>
          </div>
        </section>
      </form>
      <AddressPickerModal open={isAddressModalOpen} onClose={onCloseAddressModal} addresses={addresses} selectedAddressId={selectedAddressId} onSelect={onChooseAddress} />
    </>
  );
};

export default CheckoutForm;
