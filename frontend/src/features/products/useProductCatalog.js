import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { DEFAULT_FILTERS, GENDER_OPTIONS, normalizeText } from "./constants";

const genderLookup = Object.fromEntries(GENDER_OPTIONS.map((item) => [item.value, item.label]));

const categoryGroupLabelLookup = {
  shoes: "Giày",
  apparel: "Quần áo",
  accessories: "Phụ kiện",
};

const getLegacyCategoryGroup = (value) => {
  const normalized = normalizeText(value);

  if (["giay", "shoe", "shoes"].includes(normalized)) return "shoes";
  if (["quan ao", "quanao", "apparel", "clothing"].includes(normalized)) return "apparel";
  if (["phu kien", "phukien", "accessory", "accessories"].includes(normalized)) return "accessories";

  return "";
};

export const useProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pageData, setPageData] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("keyword") || "",
      categoryId: searchParams.get("categoryId") || "",
      categoryIds: searchParams.get("categoryIds") || "",
      categoryGroup: searchParams.get("categoryGroup") || "",
      brandId: searchParams.get("brandId") || "",
      sportId: searchParams.get("sportId") || "",
      gender: searchParams.get("gender") || "",
      promotionOnly: searchParams.get("promotionOnly") || "",
      promotionId: searchParams.get("promotionId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 0),
      size: Number(searchParams.get("size") || 12),
    }),
    [searchParams]
  );

  const [formValues, setFormValues] = useState(filters);

  useEffect(() => {
    setFormValues(filters);
  }, [filters]);

  const buildParams = () => {
    const params = {
      page: filters.page,
      size: filters.size,
      sort: filters.sort,
    };

    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.categoryGroup && !filters.categoryId) params.categoryGroup = filters.categoryGroup;
    if (filters.categoryIds && !filters.categoryId && !filters.categoryGroup) params.categoryIds = filters.categoryIds;
    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.sportId) params.sportId = filters.sportId;
    if (filters.gender) params.gender = filters.gender;
    if (filters.promotionOnly) params.promotionOnly = filters.promotionOnly;
    if (filters.promotionId) params.promotionId = filters.promotionId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    return params;
  };

  const updateSearchParams = (nextValues) => {
    const shouldClearCategoryGroup = Object.prototype.hasOwnProperty.call(nextValues, "categoryId");

    const merged = {
      ...filters,
      ...nextValues,
      ...(shouldClearCategoryGroup ? { categoryGroup: "", categoryIds: "" } : {}),
    };

    const params = {};

    if (merged.keyword) params.keyword = merged.keyword;
    if (merged.categoryId) params.categoryId = merged.categoryId;
    if (merged.categoryGroup && !merged.categoryId) params.categoryGroup = merged.categoryGroup;
    if (merged.categoryIds && !merged.categoryId && !merged.categoryGroup) params.categoryIds = merged.categoryIds;
    if (merged.brandId) params.brandId = merged.brandId;
    if (merged.sportId) params.sportId = merged.sportId;
    if (merged.gender) params.gender = merged.gender;
    if (merged.promotionOnly) params.promotionOnly = merged.promotionOnly;
    if (merged.promotionId) params.promotionId = merged.promotionId;
    if (merged.minPrice) params.minPrice = merged.minPrice;
    if (merged.maxPrice) params.maxPrice = merged.maxPrice;
    if (merged.sort && merged.sort !== "newest") params.sort = merged.sort;
    if (merged.page && merged.page !== 0) params.page = String(merged.page);
    if (merged.size && merged.size !== 12) params.size = String(merged.size);

    setSearchParams(params);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterLoading(true);
        const [categoriesRes, brandsRes, sportsRes] = await Promise.all([
          getCategoriesApi(),
          getBrandsApi(),
          getSportsApi(),
        ]);

        setCategories(categoriesRes?.data || []);
        setBrands(brandsRes?.data || []);
        setSports(sportsRes?.data || []);
      } catch (error) {
        console.error("Không thể tải dữ liệu bộ lọc", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    if (filterLoading) return;

    const legacyCategory = searchParams.get("category");
    const legacyBrand = searchParams.get("brand");
    const legacySport = searchParams.get("sport");
    const legacySale = searchParams.get("sale");
    const legacyPromotion = searchParams.get("promotion");

    let needUpdate = false;
    const nextParams = new URLSearchParams(searchParams);

    if (legacyCategory && !searchParams.get("categoryId") && !searchParams.get("categoryGroup")) {
      const legacyGroup = getLegacyCategoryGroup(legacyCategory);

      if (legacyGroup) {
        nextParams.set("categoryGroup", legacyGroup);
        nextParams.delete("category");
        needUpdate = true;
      } else {
        const matchedCategory = categories.find(
          (item) => normalizeText(item.name) === normalizeText(legacyCategory)
        );

        if (matchedCategory) {
          nextParams.set("categoryId", String(matchedCategory.id));
          nextParams.delete("category");
          needUpdate = true;
        }
      }
    }

    if (legacyBrand && !searchParams.get("brandId")) {
      const matchedBrand = brands.find(
        (item) => normalizeText(item.name) === normalizeText(legacyBrand)
      );

      if (matchedBrand) {
        nextParams.set("brandId", String(matchedBrand.id));
        nextParams.delete("brand");
        needUpdate = true;
      }
    }

    if (legacySport && !searchParams.get("sportId")) {
      const matchedSport = sports.find(
        (item) => normalizeText(item.name) === normalizeText(legacySport)
      );

      if (matchedSport) {
        nextParams.set("sportId", String(matchedSport.id));
        nextParams.delete("sport");
        needUpdate = true;
      }
    }

    if ((legacySale === "true" || legacyPromotion === "true") && !searchParams.get("promotionOnly")) {
      nextParams.set("promotionOnly", "true");
      nextParams.delete("sale");
      nextParams.delete("promotion");
      needUpdate = true;
    }

    if (needUpdate) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filterLoading, categories, brands, sports, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getProductsApi(buildParams());
        const data = response?.data || {};

        setProducts(Array.isArray(data.content) ? data.content : []);
        setPageData({
          page: data.page ?? 0,
          size: data.size ?? 12,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          last: data.last ?? true,
        });
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message || "Không thể tải danh sách sản phẩm";
        setErrorMessage(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const applyFilters = (nextValues, options = {}) => {
    const normalizedNextValues = Object.prototype.hasOwnProperty.call(nextValues, "categoryId")
      ? { ...nextValues, categoryIds: "", categoryGroup: "" }
      : nextValues;

    const merged = {
      ...formValues,
      ...normalizedNextValues,
      page: normalizedNextValues.page ?? 0,
    };

    setFormValues(merged);
    updateSearchParams(merged);

    if (options.closeMobile) {
      setMobileFilterOpen(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= pageData.totalPages) return;

    updateSearchParams({ page: newPage });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setFormValues(DEFAULT_FILTERS);
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const activeFilterChips = useMemo(() => {
    const category = categories.find((item) => String(item.id) === String(filters.categoryId));
    const brand = brands.find((item) => String(item.id) === String(filters.brandId));
    const sport = sports.find((item) => String(item.id) === String(filters.sportId));
    const groupLabel = categoryGroupLabelLookup[filters.categoryGroup];

    const chips = [];

    if (filters.keyword) chips.push({ key: "keyword", label: `Tìm kiếm: ${filters.keyword}` });
    if (category) chips.push({ key: "categoryId", label: `Danh mục: ${category.name}` });
    if (!category && groupLabel) chips.push({ key: "categoryGroup", label: `Danh mục: ${groupLabel}` });
    if (brand) chips.push({ key: "brandId", label: `Hãng: ${brand.name}` });
    if (sport) chips.push({ key: "sportId", label: `Môn thể thao: ${sport.name}` });
    if (filters.gender) chips.push({ key: "gender", label: `Giới tính: ${genderLookup[filters.gender]}` });
    if (filters.promotionOnly) chips.push({ key: "promotionOnly", label: "Đang khuyến mãi" });
    if (filters.promotionId) chips.push({ key: "promotionId", label: "Theo chương trình khuyến mãi" });
    if (filters.minPrice) {
      chips.push({ key: "minPrice", label: `Từ ${Number(filters.minPrice).toLocaleString("vi-VN")}đ` });
    }
    if (filters.maxPrice) {
      chips.push({ key: "maxPrice", label: `Đến ${Number(filters.maxPrice).toLocaleString("vi-VN")}đ` });
    }

    return chips;
  }, [filters, categories, brands, sports]);

  const handleRemoveChip = (key) => {
    if (key === "categoryGroup") {
      updateSearchParams({ categoryGroup: "", categoryIds: "", page: 0 });
      return;
    }

    updateSearchParams({ [key]: "", page: 0 });
  };

  const selectedSortLabel = useMemo(() => {
    const lookup = {
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      priceAsc: "Giá thấp đến cao",
      priceDesc: "Giá cao đến thấp",
      popular: "Bán chạy",
      discountDesc: "Giảm giá nhiều",
    };
    return lookup[filters.sort] || "Mới nhất";
  }, [filters.sort]);

  return {
    filters,
    formValues,
    products,
    pageData,
    categories,
    brands,
    sports,
    loading,
    filterLoading,
    errorMessage,
    mobileFilterOpen,
    activeFilterChips,
    selectedSortLabel,
    setMobileFilterOpen,
    applyFilters,
    handlePageChange,
    handleResetFilters,
    handleRemoveChip,
  };
};
