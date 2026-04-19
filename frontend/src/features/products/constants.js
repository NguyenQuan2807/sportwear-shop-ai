export const DEFAULT_FILTERS = {
  categoryId: "",
  brandId: "",
  sportId: "",
  gender: "",
  promotionOnly: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 0,
  size: 12,
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "priceAsc", label: "Giá thấp đến cao" },
  { value: "priceDesc", label: "Giá cao đến thấp" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "UNISEX", label: "Unisex" },
];

export const PRICE_OPTIONS = [
  { value: "under500", label: "Dưới 500.000đ", min: "", max: "500000" },
  { value: "500to1000", label: "500.000đ - 1.000.000đ", min: "500000", max: "1000000" },
  { value: "1000to2000", label: "1.000.000đ - 2.000.000đ", min: "1000000", max: "2000000" },
  { value: "over2000", label: "Trên 2.000.000đ", min: "2000000", max: "" },
];

export const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
