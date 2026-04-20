import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginApi } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const LoginPasswordPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
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
      const backendMessage = error?.response?.data?.message || "Đăng nhập thất bại";
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
      <div className="mx-auto w-full max-w-[480px] pt-4">
        <h1 className="text-[54px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[60px]">
          Mật khẩu của bạn là gì?
        </h1>

        <div className="mt-5 text-[18px] text-black/80">
          {email}{" "}
          <Link to="/login" className="underline underline-offset-4 text-black/50">
            Thay đổi
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu*"
                className={`h-16 w-full rounded-2xl border bg-transparent px-5 pr-14 text-[18px] outline-none transition ${
                  errorMessage ? "border-red-500" : "border-black/25 focus:border-black"
                }`}
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

            {errorMessage ? (
              <p className="mt-2 text-sm font-medium text-red-500">{errorMessage}</p>
            ) : null}
          </div>

          <Link
            to={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="block text-[16px] text-black/55 underline underline-offset-4"
          >
            Quên mật khẩu?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-black px-8 text-[18px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPasswordPage;
