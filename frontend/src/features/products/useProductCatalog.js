import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";
import { getBrandsApi } from "../../services/brandService";
import { getSportsApi } from "../../services/sportService";
import { DEFAULT_FILTERS, normalizeText } from "./constants";

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
      brandId: searchParams.get("brandId") || "",
      sportId: searchParams.get("sportId") || "",
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

    if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.sportId) params.sportId = filters.sportId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    return params;
  };

  const updateSearchParams = (nextValues) => {
    const merged = {
      ...filters,
      ...nextValues,
    };

    const params = {};

    if (merged.keyword) params.keyword = merged.keyword;
    if (merged.categoryId) params.categoryId = merged.categoryId;
    if (merged.brandId) params.brandId = merged.brandId;
    if (merged.sportId) params.sportId = merged.sportId;
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

  useEffect(() => {
    if (filterLoading) return;

    const legacyCategory = searchParams.get("category");
    const legacyBrand = searchParams.get("brand");
    const legacySport = searchParams.get("sport");

    let needUpdate = false;
    const nextParams = new URLSearchParams(searchParams);

    if (legacyCategory && !searchParams.get("categoryId")) {
      const matchedCategory = categories.find(
        (item) => normalizeText(item.name) === normalizeText(legacyCategory)
      );

      if (matchedCategory) {
        nextParams.set("categoryId", String(matchedCategory.id));
        nextParams.delete("category");
        needUpdate = true;
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

    if (needUpdate) {
      setSearchParams(nextParams);
    }
  }, [filterLoading, categories, brands, sports, searchParams, setSearchParams]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateSearchParams({
      ...formValues,
      page: 0,
    });
    setMobileFilterOpen(false);
  };

  const handleSelectFilterChange = (event) => {
    const { name, value } = event.target;

    const nextValues = {
      ...formValues,
      [name]: value,
      page: 0,
    };

    setFormValues(nextValues);
    updateSearchParams(nextValues);
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
    const category = categories.find(
      (item) => String(item.id) === String(filters.categoryId)
    );
    const brand = brands.find(
      (item) => String(item.id) === String(filters.brandId)
    );
    const sport = sports.find(
      (item) => String(item.id) === String(filters.sportId)
    );

    const chips = [];

    if (filters.keyword) {
      chips.push({
        key: "keyword",
        label: `Từ khóa: ${filters.keyword}`,
      });
    }

    if (category) {
      chips.push({
        key: "categoryId",
        label: `Danh mục: ${category.name}`,
      });
    }

    if (brand) {
      chips.push({
        key: "brandId",
        label: `Thương hiệu: ${brand.name}`,
      });
    }

    if (sport) {
      chips.push({
        key: "sportId",
        label: `Môn thể thao: ${sport.name}`,
      });
    }

    if (filters.minPrice) {
      chips.push({
        key: "minPrice",
        label: `Giá từ: ${Number(filters.minPrice).toLocaleString("vi-VN")}đ`,
      });
    }

    if (filters.maxPrice) {
      chips.push({
        key: "maxPrice",
        label: `Đến: ${Number(filters.maxPrice).toLocaleString("vi-VN")}đ`,
      });
    }

    return chips;
  }, [filters, categories, brands, sports]);

  const handleRemoveChip = (key) => {
    updateSearchParams({
      [key]: "",
      page: 0,
    });
  };

  const selectedSortLabel = useMemo(() => {
    const fallback = "Mới nhất";
    const lookup = {
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      nameAsc: "Tên A-Z",
      nameDesc: "Tên Z-A",
    };
    return lookup[filters.sort] || fallback;
  }, [filters.sort]);

  const hasPromotion = products.some((product) => product.onPromotion);

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
    hasPromotion,
    setMobileFilterOpen,
    handleInputChange,
    handleSearchSubmit,
    handleSelectFilterChange,
    handlePageChange,
    handleResetFilters,
    handleRemoveChip,
  };
};
