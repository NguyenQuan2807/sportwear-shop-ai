import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/products/${product.id}`}
      className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-square w-full bg-slate-100">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase text-blue-600">
          {product.sportName}
        </p>

        <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-slate-800">
          {product.name}
        </h3>

        <div className="space-y-1 text-sm text-slate-500">
          <p>Brand: {product.brandName}</p>
          <p>Category: {product.categoryName}</p>
          <p>Gender: {product.gender}</p>
        </div>

        <div className="pt-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              product.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {product.isActive ? "Đang bán" : "Ngừng bán"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;