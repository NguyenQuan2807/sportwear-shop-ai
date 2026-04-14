import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCartApi } from "../../services/cartService";
import { createOrderApi } from "../../services/orderService";

const DEFAULT_FORM = {
  shippingAddress: "",
  receiverName: "",
  receiverPhone: "",
  note: "",
  paymentMethod: "COD",
};

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;

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

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const validateForm = () => {
    if (!formData.receiverName.trim()) {
      return "Vui lòng nhập tên người nhận";
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
      return "VNPay và MoMo đang được chuẩn bị giao diện. Hiện tại bạn vui lòng dùng COD.";
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

  const handleSelectPayment = (method) => {
    if (method !== "COD") return;

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

      await createOrderApi(formData);

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
    totalAmount,
    handleChange,
    handleSelectPayment,
    handleSubmitOrder,
  };
};
