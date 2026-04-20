import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await loginApi(formData);
      const { token, accessToken, refreshToken, user, message } = response.data;
      const effectiveToken = accessToken || token;

      if (!effectiveToken || !user) {
        throw new Error(message || "Dữ liệu đăng nhập không hợp lệ");
      }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">Đăng nhập</h1>

        <p className="mb-6 text-center text-sm text-slate-500">
          Đăng nhập để tiếp tục mua sắm
        </p>

        {errorMessage ? (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-4">
              <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
