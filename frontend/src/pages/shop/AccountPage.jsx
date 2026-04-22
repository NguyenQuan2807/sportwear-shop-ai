import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import AddressModal from "../../components/account/AddressModal";
import AccountDetailsModal from "../../components/account/AccountDetailsModal";
import {
  createMyAddressApi,
  deleteMyAddressApi,
  getMyAddressesApi,
  getMyProfileApi,
  updateMyAddressApi,
  updateMyProfileApi,
} from "../../services/profileService";

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
  </svg>
);

const AddressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const tabs = [
  { key: "account", label: "Chi tiết tài khoản", icon: <UserIcon /> },
  { key: "addresses", label: "Địa chỉ giao hàng", icon: <AddressIcon /> },
];

const emptyProfile = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  roleName: "",
};

const AccountPage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [profileDetails, setProfileDetails] = useState(emptyProfile);
  const [addresses, setAddresses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const defaultAddressId = useMemo(
    () => addresses.find((item) => item.isDefault)?.id ?? null,
    [addresses]
  );

  useEffect(() => {
    const run = async () => {
      try {
        setPageLoading(true);
        const [profileResponse, addressResponse] = await Promise.all([
          getMyProfileApi(),
          getMyAddressesApi(),
        ]);

        setProfileDetails(profileResponse.data || emptyProfile);
        setAddresses(Array.isArray(addressResponse.data) ? addressResponse.data : []);
      } catch (error) {
        console.error(error);
        alert("Không thể tải thông tin tài khoản.");
      } finally {
        setPageLoading(false);
      }
    };

    run();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa địa chỉ này?");
    if (!ok) return;

    try {
      await deleteMyAddressApi(id);
      setAddresses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Xóa địa chỉ thất bại.");
    }
  };

  const handleSubmitAddress = async (payload) => {
    try {
      setSubmittingAddress(true);
      if (payload.id) {
        const response = await updateMyAddressApi(payload.id, payload);
        setAddresses((prev) =>
          prev.map((item) => {
            if (item.id === response.data.id) {
              return response.data;
            }
            return response.data.isDefault ? { ...item, isDefault: false } : item;
          })
        );
      } else {
        const response = await createMyAddressApi(payload);
        setAddresses((prev) => {
          const next = [response.data, ...prev];
          return response.data.isDefault
            ? next.map((item) =>
                item.id === response.data.id ? item : { ...item, isDefault: false }
              )
            : next;
        });
      }

      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Lưu địa chỉ thất bại.");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleSubmitAccountDetails = async (payload) => {
    try {
      setSubmittingProfile(true);
      const response = await updateMyProfileApi(payload);
      setProfileDetails(response.data);
      setUser((prev) => ({
        ...(prev || {}),
        fullName: response.data.fullName,
        email: response.data.email,
        dateOfBirth: response.data.dateOfBirth,
        phone: response.data.phone,
        roleName: response.data.roleName,
      }));
      setIsAccountModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Cập nhật tài khoản thất bại.");
    } finally {
      setSubmittingProfile(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] py-10">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="bg-white p-8 shadow-sm text-neutral-600">Đang tải dữ liệu tài khoản...</div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-[#ffffff] py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 lg:flex-row lg:px-8">
        <aside className="w-full bg-white p-5 shadow-sm lg:w-[320px] lg:p-6">
          <h1 className="mb-6 text-[34px] font-semibold tracking-[-0.02em] text-neutral-900">Tài khoản</h1>

          <div className="space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-neutral-500"}>{tab.icon}</span>
                  <span className="text-[15px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 bg-white p-6 sm:p-8 lg:p-10">
          {activeTab === "account" ? (
            <div className="max-w-[820px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-neutral-900">Chi tiết tài khoản</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 px-6 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Sửa thông tin
                </button>
              </div>

              <div className="mt-8 grid gap-5">
                <ReadOnlyField label="Họ và tên" value={profileDetails.fullName || user?.fullName || "Chưa có dữ liệu"} />
                <ReadOnlyField label="Email" value={profileDetails.email || user?.email || "Chưa có dữ liệu"} />
                <ReadOnlyField label="Mật khẩu" value="••••••••" />
                <ReadOnlyField label="Ngày sinh" value={formatDateOfBirth(profileDetails.dateOfBirth) || "Chưa cập nhật"} />
              </div>
            </div>
          ) : (
            <div className="max-w-[920px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-neutral-900">Địa chỉ giao hàng</h2>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 px-6 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Thêm địa chỉ
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-10  px-6 py-10 text-center">
                  <p className="text-[16px] text-neutral-600">Bạn chưa có địa chỉ giao hàng nào.</p>
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {addresses.map((address) => {
                    const isDefault = defaultAddressId === address.id;
                    return (
                      <article key={address.id} className=" border border-neutral-200 p-5 transition hover:border-neutral-300">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-neutral-900">{address.fullName}</h3>
                              {isDefault ? (
                                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">Mặc định</span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-neutral-600">{address.phoneNumber}</p>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">
                              {address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(address)}
                              className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(address.id)}
                              className="rounded-full border border-red-200 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <AddressModal
        open={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSubmitAddress}
        initialData={editingAddress}
        submitting={submittingAddress}
      />

      <AccountDetailsModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleSubmitAccountDetails}
        initialData={profileDetails}
        submitting={submittingProfile}
      />
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>
    <div className="flex h-14 items-center rounded-[10px] border border-neutral-300 bg-neutral-50 px-4 text-[15px] text-neutral-800">
      {value}
    </div>
  </div>
);

const formatDateOfBirth = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export default AccountPage;
