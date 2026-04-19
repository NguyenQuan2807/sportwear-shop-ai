import { Link } from "react-router-dom";
import WishlistProductCard from "../../components/product/WishlistProductCard";
import useWishlist from "../../hooks/useWishlist";

const EmptyHeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
    <path
      d="M12 20.2s-6.7-4.35-9.2-8.28C1.22 9.55 2.1 6.5 4.9 5.45c2.02-.76 3.72.05 4.77 1.4L12 9.2l2.33-2.35c1.05-1.35 2.75-2.16 4.77-1.4 2.8 1.05 3.68 4.1 2.1 6.47C18.7 15.85 12 20.2 12 20.2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WishlistPage = () => {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Sản phẩm yêu thích</h1>
          {wishlistCount > 0 ? (
            <p className="mt-2 text-sm text-black/55">{wishlistCount} sản phẩm đã lưu</p>
          ) : null}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <section className="rounded-[32px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black/40">
            <EmptyHeartIcon />
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-black">
            Danh sách yêu thích của bạn đang trống
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
            Hãy lưu lại những sản phẩm bạn muốn xem lại sau. Khi tìm thấy món phù hợp,
            bạn có thể quay lại đây để mua nhanh hơn.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Khám phá sản phẩm
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3 xl:gap-8">
          {wishlistItems.map((product) => (
            <WishlistProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
};

export default WishlistPage;
