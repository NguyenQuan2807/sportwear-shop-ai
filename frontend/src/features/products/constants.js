export const DEFAULT_FILTERS = {
  keyword: "",
  categoryId: "",
  brandId: "",
  sportId: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 0,
  size: 12,
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "nameAsc", label: "Tên A-Z" },
  { value: "nameDesc", label: "Tên Z-A" },
];

export const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
