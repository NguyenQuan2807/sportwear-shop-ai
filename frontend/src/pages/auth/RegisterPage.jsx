import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeRegisterApi, requestRegisterCodeApi } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [formData, setFormData] = useState({
    code: "",
    firstName: "",
    surname: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("We've sent a code to your email.");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.replace(/\D/g, "").slice(0, 8) : value,
    }));
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      setErrorMessage("");
      const response = await requestRegisterCodeApi({ email });
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
      const fullName = `${formData.firstName} ${formData.surname}`.trim();
      const response = await completeRegisterApi({
        email,
        code: formData.code,
        fullName,
        password: formData.password,
      });

      const { token, accessToken, refreshToken, user } = response.data;
      const effectiveToken = accessToken || token;

      login({
        token: effectiveToken,
        accessToken: effectiveToken,
        refreshToken,
        user,
      });

      navigate("/");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Đăng ký thất bại";
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
          Hãy đăng ký để trở thành thành viên của Sportwear Shop.
        </h1>

        <div className="mt-5 text-[18px] text-black/80">
          Chúng tôi đã gửi mã đến <span className="font-medium text-black">{email}</span>{" "}
          <Link to="/login" className="underline underline-offset-4 text-black/50">
            thay đổi
          </Link>
        </div>

        {successMessage ? <p className="mt-3 text-sm text-black/55">{successMessage}</p> : null}
        {errorMessage ? <p className="mt-3 text-sm font-medium text-red-500">{errorMessage}</p> : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="relative">
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Tên của bạn*"
              className="h-16 rounded-2xl border border-black/25 bg-transparent px-5 text-[18px] outline-none transition focus:border-black"
              required
            />
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Họ của bạn*"
              className="h-16 rounded-2xl border border-black/25 bg-transparent px-5 text-[18px] outline-none transition focus:border-black"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu*"
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[18px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
