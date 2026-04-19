const ProductPagination = ({ page, totalPages, last, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);

  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black disabled:opacity-35"
      >
        Trước
      </button>

      {pages.map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPageChange(index)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            page === index ? "bg-black text-white" : "border border-black/10 text-black"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={last}
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black disabled:opacity-35"
      >
        Sau
      </button>
    </div>
  );
};

export default ProductPagination;
