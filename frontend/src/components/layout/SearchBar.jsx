import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const suggestionPool = [
  "Giày chạy bộ nam",
  "Áo thể thao nữ",
  "Quần short gym",
  "Phụ kiện tập luyện",
  "Giày bóng đá",
  "Áo khoác running",
  "Tất thể thao",
  "Balo thể thao",
  "Flash sale",
  "Best seller",
];

const SearchBar = ({ className = "" }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return suggestionPool.slice(0, 6);

    return suggestionPool
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const keyword = query.trim();
    if (!keyword) {
      navigate("/products");
      return;
    }
    navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    setIsFocused(false);
  };

  const handleSuggestionClick = (value) => {
    setQuery(value);
    navigate(`/products?keyword=${encodeURIComponent(value)}`);
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Tìm giày, quần áo, phụ kiện, thương hiệu..."
          className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-28 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
        />

        <button
          type="submit"
          className="absolute right-1.5 top-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Tìm
        </button>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Gợi ý tìm kiếm
          </div>

          <div className="py-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    />
                  </svg>
                </span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;