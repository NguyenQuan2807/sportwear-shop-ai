import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCartApi } from "../../services/cartService";
import { createOrderApi } from "../../services/orderService";

const DEFAULT_FORM = {
  email: "",
  firstName: "",
  lastName: "",
  shippingAddress: "",
  receiverPhone: "",
  note: "",
  paymentMethod: "COD",
  billingSameAsShipping: true,
};

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useCheckout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getCartApi();
      setCart(response.data);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải giỏ hàng";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
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

    if (!formData.shippingAddress.trim()) {
      return "Vui lòng nhập địa chỉ giao hàng";
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
  };

  const handleToggleBilling = () => {
    setFormData((prev) => ({
      ...prev,
      billingSameAsShipping: !prev.billingSameAsShipping,
    }));
  };

  const handleSelectPayment = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();

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
        shippingAddress: formData.shippingAddress,
        receiverName,
        receiverPhone: formData.receiverPhone,
        note: formData.note,
        paymentMethod: formData.paymentMethod,
      });

      setSuccessMessage("Đặt hàng thành công");

      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tạo đơn hàng";
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
    totalQuantity,
    subTotalAmount,
    discountAmount,
    shippingFee,
    totalAmount,
    handleChange,
    handleToggleBilling,
    handleSelectPayment,
    handleSubmitOrder,
  };
};
