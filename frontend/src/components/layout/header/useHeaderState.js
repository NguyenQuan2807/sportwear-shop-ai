import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productUrl, visibleNavItems } from "./header.data";

const SHOW_TOP_THRESHOLD = 8;
const HIDE_TOP_THRESHOLD = 42;

const useHeaderState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [query, setQuery] = useState("");
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
    () => visibleNavItems.find((item) => item.label === activeMenu),
    [activeMenu]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = query.trim();

    if (!keyword) {
      navigate("/products");
      return;
    }

    navigate(productUrl({ keyword }));
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const handleQuickSearch = (value) => {
    navigate(productUrl({ keyword: value }));
    setMobileSearchOpen(false);
    setMobileOpen(false);
  };

  const isItemActive = (item) => {
    if (location.pathname !== "/products") return false;

    const params = new URLSearchParams(location.search);

    switch (item.label) {
      case "Nam":
        return params.get("gender") === "MALE";
      case "Nữ":
        return params.get("gender") === "FEMALE";
      case "Giày":
        return params.get("category") === "Giày";
      case "Quần Áo":
        return params.get("category") === "Quần áo";
      case "Phụ kiện":
        return params.get("category") === "Phụ kiện";
      case "Sale":
        return params.get("sale") === "true";
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
