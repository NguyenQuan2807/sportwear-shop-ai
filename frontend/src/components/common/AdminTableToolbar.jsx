const AdminTableToolbar = ({
  title,
  description,
  searchTerm,
  onSearchChange,
  placeholder = "Tìm kiếm...",
  createLabel,
  onCreateClick,
  resultCount,
  children,
}) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          {description ? (
            <p className="mt-2 text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {onCreateClick ? (
              <button
                onClick={onCreateClick}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {createLabel}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Tìm thấy <span className="font-semibold text-slate-700">{resultCount}</span>{" "}
              kết quả
            </p>

            {searchTerm ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="w-fit text-sm font-medium text-slate-500 transition hover:text-slate-800"
              >
                Xóa từ khóa
              </button>
            ) : null}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminTableToolbar;