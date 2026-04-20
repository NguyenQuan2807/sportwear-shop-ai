import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { forgotPasswordApi, resetPasswordApi } from "../../services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const sendCode = async () => {
      if (!email) return;

      try {
        const response = await forgotPasswordApi({ email });
        setSuccessMessage(response.data?.message || "We've sent a code to your email.");
      } catch (error) {
        const backendMessage = error?.response?.data?.message || "Không thể gửi mã xác thực";
        setErrorMessage(backendMessage);
      }
    };

    sendCode();
  }, [email]);

  const handleResendCode = async () => {
    try {
      setResending(true);
      setErrorMessage("");
      const response = await forgotPasswordApi({ email });
      setSuccessMessage(response.data?.message || "Đã gửi lại mã xác thực.");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể gửi lại mã";
      setErrorMessage(backendMessage);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await resetPasswordApi({
        email,
        code,
        newPassword,
      });
      navigate(`/login/password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể đặt lại mật khẩu";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-[560px] pt-4">
        <h1 className="text-[54px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[60px]">
          Xác nhận email của bạn và nhập mật khẩu mới.
        </h1>

        <div className="mt-5 text-[18px] leading-8 text-black/80">
          Chúng tôi đã gửi mã đến <span className="font-medium text-black">{email}</span>{" "}
          <Link to="/login" className="underline underline-offset-4 text-black/50">
            Chỉnh sửa
          </Link>
        </div>

        {successMessage ? <p className="mt-3 text-sm text-black/55">{successMessage}</p> : null}
        {errorMessage ? <p className="mt-3 text-sm font-medium text-red-500">{errorMessage}</p> : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Mã xác thực*"
              className="h-16 w-full rounded-2xl border border-black/25 bg-transparent px-5 pr-14 text-[18px] outline-none transition focus:border-black"
              required
            />
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-black/70 disabled:opacity-50"
            >
              ↻
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới*"
              className="h-16 w-full rounded-2xl border border-black/25 bg-transparent px-5 pr-14 text-[18px] outline-none transition focus:border-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-black/70"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <div className="space-y-1 text-[14px] leading-6 text-black/50">
            <p>× Minimum of 8 characters</p>
            <p>× Uppercase, lowercase letters and one number</p>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Link
              to={`/login/password?email=${encodeURIComponent(email)}`}
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/20 px-8 text-[18px] font-medium text-black transition hover:border-black"
            >
              Quay lại
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[18px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
