import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserApi } from "../../services/authService";
import { getCartApi } from "../../services/cartService";
import { createOrderApi } from "../../services/orderService";
import { createMyAddressApi, getMyAddressesApi } from "../../services/profileService";

const DEFAULT_FORM = {
  email: "",
  firstName: "",
  lastName: "",
  addressLine: "",
  provinceCode: "",
  provinceName: "",
  districtCode: "",
  districtName: "",
  wardCode: "",
  wardName: "",
  receiverPhone: "",
  note: "",
  paymentMethod: "COD",
  billingSameAsShipping: true,
  saveNewAddress: false,
};

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const splitFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[parts.length - 1],
    lastName: parts.slice(0, -1).join(" "),
  };
};

const buildShippingAddress = (formData) =>
  [formData.addressLine, formData.wardName, formData.districtName, formData.provinceName]
    .filter(Boolean)
    .join(", ");

export const useCheckout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const fillAddressIntoForm = (address, keepSaveFlag = false) => {
    const { firstName, lastName } = splitFullName(address.fullName || "");
    setSelectedAddressId(address.id || null);
    setFormData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      addressLine: address.addressLine || prev.addressLine,
      provinceCode: address.provinceCode || "",
      provinceName: address.provinceName || "",
      districtCode: address.districtCode || "",
      districtName: address.districtName || "",
      wardCode: address.wardCode || "",
      wardName: address.wardName || "",
      receiverPhone: address.phoneNumber || prev.receiverPhone,
      saveNewAddress: keepSaveFlag ? prev.saveNewAddress : false,
    }));
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [cartResponse, currentUserResponse, addressesResponse] = await Promise.all([
        getCartApi(),
        getCurrentUserApi(),
        getMyAddressesApi(),
      ]);

      setCart(cartResponse.data);

      const currentUser = currentUserResponse.data || {};
      const savedAddresses = Array.isArray(addressesResponse.data) ? addressesResponse.data : [];
      setAddresses(savedAddresses);

      const { firstName, lastName } = splitFullName(currentUser.fullName || "");
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || prev.email,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        receiverPhone: currentUser.phone || prev.receiverPhone,
      }));

      const defaultAddress = savedAddresses.find((item) => item.isDefault) || null;
      if (defaultAddress) {
        fillAddressIntoForm(defaultAddress);
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tải dữ liệu thanh toán";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const items = cart?.items || [];
  const subTotalAmount = cart?.subTotalAmount || 0;
  const discountAmount = cart?.discountAmount || 0;
  const totalAmount = cart?.totalAmount || 0;
  const shippingFee = Math.max(totalAmount - (subTotalAmount - discountAmount), 0);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const receiverName = `${formData.firstName} ${formData.lastName}`.trim();

  const validateForm = () => {
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      return "Email không hợp lệ";
    }
    if (!formData.firstName.trim()) {
      return "Vui lòng nhập tên";
    }
    if (!formData.lastName.trim()) {
      return "Vui lòng nhập họ";
    }
    if (!PHONE_REGEX.test(formData.receiverPhone.trim())) {
      return "Số điện thoại không hợp lệ";
    }
    if (!formData.addressLine.trim()) {
      return "Vui lòng nhập địa chỉ cụ thể";
    }
    if (!formData.provinceCode) {
      return "Vui lòng chọn tỉnh/thành phố";
    }
    if (!formData.districtCode) {
      return "Vui lòng chọn quận/huyện";
    }
    if (!formData.wardCode) {
      return "Vui lòng chọn phường/xã";
    }
    if (!cart?.items || cart.items.length === 0) {
      return "Giỏ hàng đang trống";
    }
    if (formData.paymentMethod !== "COD") {
      return "Momo và VNPay đã có UI chọn phương thức, nhưng backend thanh toán online chưa được tích hợp xong. Hiện tại bạn vui lòng dùng COD để tạo đơn thật.";
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (["addressLine", "receiverPhone", "firstName", "lastName"].includes(name)) {
      setSelectedAddressId(null);
    }
  };

  const handleSelectPayment = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleOpenAddressModal = () => setIsAddressModalOpen(true);
  const handleCloseAddressModal = () => setIsAddressModalOpen(false);

  const handleChooseAddress = (address) => {
    fillAddressIntoForm(address);
    setIsAddressModalOpen(false);
  };

  const handleProvinceChange = (provinceCode) => {
    const province = addresses.length
      ? null
      : null;
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      provinceCode,
      provinceName: "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (districtCode) => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      districtCode,
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (wardCode) => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      wardCode,
      wardName: "",
    }));
  };

  const syncLocationNames = ({ provinces, provinceCode, districtCode, wardCode }) => {
    const province = provinces.find((item) => item.code === provinceCode);
    const district = province?.districts?.find((item) => item.code === districtCode);
    const ward = district?.wards?.find((item) => item.code === wardCode);
    return {
      provinceName: province?.name || "",
      districtName: district?.name || "",
      wardName: ward?.name || "",
    };
  };

  const handleToggleSaveAddress = () => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      saveNewAddress: !prev.saveNewAddress,
    }));
  };

  const handleSubmitOrder = async (event, locationTree) => {
    event.preventDefault();

    const locationNames = syncLocationNames({
      provinces: locationTree,
      provinceCode: formData.provinceCode,
      districtCode: formData.districtCode,
      wardCode: formData.wardCode,
    });

    const normalizedForm = {
      ...formData,
      ...locationNames,
    };

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createOrderApi({
        shippingAddress: buildShippingAddress(normalizedForm),
        receiverName,
        receiverPhone: normalizedForm.receiverPhone,
        note: normalizedForm.note,
        paymentMethod: normalizedForm.paymentMethod,
      });

      let finalSuccessMessage = "Đặt hàng thành công";

      if (normalizedForm.saveNewAddress && !selectedAddressId) {
        try {
          const addressResponse = await createMyAddressApi({
            fullName: receiverName,
            phoneNumber: normalizedForm.receiverPhone,
            addressLine: normalizedForm.addressLine,
            provinceCode: normalizedForm.provinceCode,
            provinceName: normalizedForm.provinceName,
            districtCode: normalizedForm.districtCode,
            districtName: normalizedForm.districtName,
            wardCode: normalizedForm.wardCode,
            wardName: normalizedForm.wardName,
            isDefault: false,
          });
          setAddresses((prev) => [addressResponse.data, ...prev]);
          finalSuccessMessage = "Đặt hàng thành công và đã lưu địa chỉ mới";
        } catch (saveAddressError) {
          console.error(saveAddressError);
          finalSuccessMessage = "Đặt hàng thành công nhưng lưu địa chỉ mới thất bại";
        }
      }

      setSuccessMessage(finalSuccessMessage);

      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tạo đơn hàng";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cart,
    items,
    loading,
    submitting,
    errorMessage,
    successMessage,
    formData,
    addresses,
    selectedAddressId,
    isAddressModalOpen,
    totalQuantity,
    subTotalAmount,
    discountAmount,
    shippingFee,
    totalAmount,
    handleChange,
    handleSelectPayment,
    handleOpenAddressModal,
    handleCloseAddressModal,
    handleChooseAddress,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleToggleSaveAddress,
    handleSubmitOrder,
    setFormData,
    syncLocationNames,
  };
};
