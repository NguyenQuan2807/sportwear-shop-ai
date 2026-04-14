import ProductCard from "../../components/product/ProductCard";

const ProductGrid = ({ loading, errorMessage, products, onResetFilters }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="aspect-[4/5] animate-pulse rounded-[22px] bg-slate-100" />
            <div className="mt-4 h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {errorMessage}
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-950">
          Không tìm thấy sản phẩm phù hợp
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Hãy thử đổi từ khóa, nới rộng khoảng giá hoặc xóa bớt bộ lọc để xem nhiều
          sản phẩm hơn.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Xóa bộ lọc
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
};

export default ProductGrid;
