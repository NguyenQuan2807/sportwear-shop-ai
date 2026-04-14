const ProductPagination = ({ page, totalPages, last, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <section className="flex flex-wrap items-center justify-center gap-2 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Trước
      </button>

      {Array.from({ length: totalPages }, (_, index) => index).map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPageChange(index)}
          className={`min-w-[44px] rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            page === index
              ? "bg-slate-900 text-white shadow-lg"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={last}
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sau
      </button>
    </section>
  );
};

export default ProductPagination;
