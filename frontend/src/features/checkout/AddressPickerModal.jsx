const AddressPickerModal = ({ open, onClose, addresses, selectedAddressId, onSelect }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="w-full max-w-[760px] rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[30px] font-semibold tracking-tight text-black">Chọn địa chỉ giao hàng</h3>
            <p className="mt-2 text-sm text-black/55">
              Chọn một địa chỉ đã lưu để tự động điền thông tin giao hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-black transition hover:bg-black/10"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-black/15 bg-black/[0.03] px-5 py-8 text-center text-sm text-black/60">
            Bạn chưa có địa chỉ giao hàng nào được lưu trong tài khoản.
          </div>
        ) : (
          <div className="mt-8 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {addresses.map((address) => {
              const isActive = selectedAddressId === address.id;
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => onSelect(address)}
                  className={`w-full rounded-[24px] border p-5 text-left transition ${
                    isActive
                      ? "border-black shadow-[inset_0_0_0_1px_#000]"
                      : "border-black/15 hover:border-black/35"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-black">{address.fullName}</span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        Mặc định
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-black/60">{address.phoneNumber}</p>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    {address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressPickerModal;
