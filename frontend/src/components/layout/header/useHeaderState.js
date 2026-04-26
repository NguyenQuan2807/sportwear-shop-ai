import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productUrl, visibleNavItems as fallbackNavItems } from "./header.data";

const SHOW_TOP_THRESHOLD = 8;
const HIDE_TOP_THRESHOLD = 42;

const getSearchKeywordFromLocation = (location) => {
  if (location.pathname !== "/products") return "";

  const params = new URLSearchParams(location.search);
  return params.get("keyword") || params.get("q") || params.get("search") || "";
};

const useHeaderState = (navigationItems = fallbackNavItems) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [query, setQuery] = useState(() => getSearchKeywordFromLocation(location));
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const userMenuRef = useRef(null);
  const utilityMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setMobileExpanded(null);
    setActiveMenu(null);
    setUserMenuOpen(false);
    setUtilityMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setQuery(getSearchKeywordFromLocation(location));
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setMobileSearchOpen(false);
        setMobileExpanded(null);
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;

      setIsAtTop((prev) => {
        if (prev) {
          return currentScrollY <= HIDE_TOP_THRESHOLD;
        }

        return currentScrollY <= SHOW_TOP_THRESHOLD;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }

      if (utilityMenuRef.current && !utilityMenuRef.current.contains(event.target)) {
        setUtilityMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMenuData = useMemo(
    () => navigationItems.find((item) => item.label === activeMenu),
    [activeMenu, navigationItems]
  );

  const navigateWithKeyword = (value) => {
    const keyword = String(value || "").trim();
    const shouldPreserveCurrentFilters = location.pathname === "/products";
    const params = shouldPreserveCurrentFilters
      ? new URLSearchParams(location.search)
      : new URLSearchParams();

    params.delete("page");
    params.delete("q");
    params.delete("search");

    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }

    const nextUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    navigate(nextUrl);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateWithKeyword(query);
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const handleQuickSearch = (value) => {
    navigateWithKeyword(value);
    setMobileSearchOpen(false);
    setMobileOpen(false);
  };

  const isItemActive = (item) => {
    if (location.pathname !== "/products") return false;

    const params = new URLSearchParams(location.search);
    const categoryGroup = params.get("categoryGroup");

    switch (item.label) {
      case "Nam":
        return params.get("gender") === "MALE";
      case "Nữ":
        return params.get("gender") === "FEMALE";
      case "Giày":
        return categoryGroup === "shoes" || params.get("category") === "Giày";
      case "Quần Áo":
        return categoryGroup === "apparel" || params.get("category") === "Quần áo";
      case "Phụ kiện":
        return categoryGroup === "accessories" || params.get("category") === "Phụ kiện";
      case "Sale":
        return params.get("promotionOnly") === "true" || params.get("sale") === "true" || Boolean(params.get("promotionId"));
      default:
        return false;
    }
  };

  return {
    mobileOpen,
    setMobileOpen,
    mobileSearchOpen,
    setMobileSearchOpen,
    mobileExpanded,
    setMobileExpanded,
    activeMenu,
    setActiveMenu,
    query,
    setQuery,
    userMenuOpen,
    setUserMenuOpen,
    utilityMenuOpen,
    setUtilityMenuOpen,
    isAtTop,
    userMenuRef,
    utilityMenuRef,
    activeMenuData,
    handleSearchSubmit,
    handleQuickSearch,
    isItemActive,
  };
};

export default useHeaderState;
