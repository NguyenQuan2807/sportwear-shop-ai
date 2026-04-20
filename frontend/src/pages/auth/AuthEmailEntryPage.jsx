import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailApi, requestRegisterCodeApi } from "../../services/authService";

const AuthEmailEntryPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const lookupResponse = await checkEmailApi(email.trim());
      const action = lookupResponse?.data?.action;

      if (action === "LOGIN") {
        navigate(`/login/password?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      await requestRegisterCodeApi({ email: email.trim() });
      navigate(`/register?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "Không thể tiếp tục với email này";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-[480px] pt-4">
        

        <h1 className="text-[54px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[60px]">
          Nhập email của bạn để đăng ký hoặc đăng nhập.
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-3 block text-[15px] font-medium text-black/85">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-16 w-full rounded-2xl border bg-transparent px-5 text-[18px] outline-none transition ${
                errorMessage ? "border-red-500" : "border-black/25 focus:border-black"
              }`}
              required
            />
            {errorMessage ? (
              <p className="mt-2 text-sm font-medium text-red-500">{errorMessage}</p>
            ) : null}
          </div>

          <p className="max-w-[420px] text-[15px] leading-7 text-black/55">
            Để tiếp tục, tôi đồng ý với Chính sách bảo mật và Điều khoản sử dụng của Sportwear Shop.
          </p>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-[18px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthEmailEntryPage;
