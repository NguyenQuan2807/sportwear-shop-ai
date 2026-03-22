import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="mt-16 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={logo}
                alt="Sportwear Shop Logo"
                className="h-12 w-auto object-contain"
                />
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Website thời trang thể thao fullstack tích hợp AI chatbot, quản lý
              sản phẩm, giỏ hàng, đặt hàng và thanh toán hiện đại.
            </p>

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</p>
              <p>Hotline: 0123 456 789</p>
              <p>Email: support@sportwearshop.vn</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Điều hướng
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link to="/" className="block hover:text-white">
                Trang chủ
              </Link>
              <Link to="/products" className="block hover:text-white">
                Sản phẩm
              </Link>
              <Link to="/cart" className="block hover:text-white">
                Giỏ hàng
              </Link>
              <Link to="/orders" className="block hover:text-white">
                Đơn hàng
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Hỗ trợ
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link to="/login" className="block hover:text-white">
                Tài khoản
              </Link>
              <span className="block">Chính sách giao hàng</span>
              <span className="block">Chính sách đổi trả</span>
              <span className="block">Điều khoản sử dụng</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Kết nối & thanh toán
            </h3>

            <div className="mb-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Facebook
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Instagram
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                TikTok
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                COD
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                VNPay
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                MoMo
              </span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Banking
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500">
          © 2026 Sportwear Shop AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;