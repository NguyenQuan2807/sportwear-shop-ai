import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="mt-16 text-black">
      <div className="mx-auto max-w-7xl border-t border-black/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={logo}
                alt="Sportwear Shop Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="mt-5 space-y-2 text-sm text-black">
              <p>Địa chỉ: TP. Hà Nội, Việt Nam</p>
              <p>Hotline: 0123 456 789</p>
              <p>Email: support@sportwearshop.vn</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-black">
              Điều hướng
            </h3>
            <div className="space-y-3 text-sm text-black">
              <Link to="/" className="block">
                Trang chủ
              </Link>
              <Link to="/products" className="block">
                Sản phẩm
              </Link>
              <Link to="/cart" className="block">
                Giỏ hàng
              </Link>
              <Link to="/orders" className="block">
                Đơn hàng
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-black">
              Hỗ trợ
            </h3>
            <div className="space-y-3 text-sm text-black">
              <Link to="/login" className="block">
                Tài khoản
              </Link>
              <span className="block">Chính sách giao hàng</span>
              <span className="block">Chính sách đổi trả</span>
              <span className="block">Điều khoản sử dụng</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-black">
              Kết nối & thanh toán
            </h3>

            <div className="mb-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                Facebook
              </span>
              <span className="rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                Instagram
              </span>
              <span className="rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                TikTok
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                COD
              </span>
              <span className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                VNPay
              </span>
              <span className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                MoMo
              </span>
              <span className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black">
                Banking
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;