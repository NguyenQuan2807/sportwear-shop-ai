import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="space-y-6 rounded-2xl bg-white p-10 shadow">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-slate-800">
          Sportwear Shop
        </h1>
        <p className="max-w-2xl text-slate-600">
          Website thời trang thể thao tích hợp AI, hỗ trợ tìm kiếm sản phẩm,
          giỏ hàng, đặt hàng và quản trị hệ thống.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/products"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Xem sản phẩm
        </Link>

        <Link
          to="/login"
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default HomePage;