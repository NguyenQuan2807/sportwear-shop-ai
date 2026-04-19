import CatalogProductCard from "./CatalogProductCard";

const ProductGrid = ({ loading, errorMessage, products }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-square animate-pulse bg-black/6" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-black/6" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-black/6" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-black/6" />
          </div>
        ))}
      </section>
    );
  }

  if (errorMessage) {
    return <div className="py-10 text-sm font-medium text-red-600">{errorMessage}</div>;
  }

  if (products.length === 0) {
    return <div className="py-20 text-sm text-black/55">Không có sản phẩm phù hợp.</div>;
  }

  return (
    <section className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <CatalogProductCard key={product.id} product={product} />
      ))}
    </section>
  );
};

export default ProductGrid;
