import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import useWishlist from "../../hooks/useWishlist";

const WishlistPage = () => {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 xl:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Wishlist
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Sản phẩm yêu thích
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Lưu lại những sản phẩm bạn muốn xem lại sau. Wishlist hiện được lưu
            trực tiếp trên trình duyệt của bạn.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {wishlistCount} sản phẩm
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 xl:px-8">
        {wishlistItems.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">
              Wishlist của bạn đang trống
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Hãy thêm sản phẩm từ trang danh sách hoặc quay lại mua sắm để lưu
              lại các món bạn quan tâm.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WishlistPage;
