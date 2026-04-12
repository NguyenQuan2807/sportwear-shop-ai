import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";
import { getCartApi } from "../../services/cartService";

const productUrl = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return search ? `/products?${search}` : "/products";
};

const quickSearches = [
  "Giày chạy bộ",
  "Áo khoác thể thao",
  "Quần short",
  "Balo",
  "Phụ kiện tập luyện",
];

const navItems = [
  {
    label: "Nam",
    href: productUrl({ gender: "MALE" }),
    promo: {
      eyebrow: "Nam",
      title: "Bộ sưu tập mới cho nam",
      description:
        "Khám phá giày, quần áo và phụ kiện dành cho tập luyện, chạy bộ và mặc hằng ngày.",
      cta: {
        label: "Mua ngay",
        href: productUrl({ gender: "MALE" }),
      },
    },
    sections: [
      {
        title: "Nổi bật",
        links: [
          { label: "Hàng mới về", href: productUrl({ gender: "MALE", sort: "newest" }) },
          { label: "Best Seller", href: productUrl({ gender: "MALE", sort: "best-selling" }) },
          { label: "Phong cách hằng ngày", href: productUrl({ gender: "MALE", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Giày",
        links: [
          { label: "Giày chạy bộ nam", href: productUrl({ gender: "MALE", category: "Giày", keyword: "chạy bộ" }) },
          { label: "Giày training nam", href: productUrl({ gender: "MALE", category: "Giày", keyword: "training" }) },
          { label: "Giày bóng đá nam", href: productUrl({ gender: "MALE", category: "Giày", keyword: "bóng đá" }) },
        ],
      },
      {
        title: "Quần áo",
        links: [
          { label: "Áo thun nam", href: productUrl({ gender: "MALE", category: "Quần áo", keyword: "áo thun" }) },
          { label: "Áo khoác nam", href: productUrl({ gender: "MALE", category: "Quần áo", keyword: "áo khoác" }) },
          { label: "Quần short nam", href: productUrl({ gender: "MALE", category: "Quần áo", keyword: "quần short" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Gym & Training", href: productUrl({ gender: "MALE", keyword: "gym" }) },
          { label: "Running", href: productUrl({ gender: "MALE", keyword: "running" }) },
          { label: "Tất cả sản phẩm nam", href: productUrl({ gender: "MALE" }) },
        ],
      },
    ],
  },
  {
    label: "Nữ",
    href: productUrl({ gender: "FEMALE" }),
    promo: {
      eyebrow: "Nữ",
      title: "Phong cách mới cho nữ",
      description:
        "Từ chạy bộ đến tập luyện và thời trang hằng ngày, mọi lựa chọn đều ở đây.",
      cta: {
        label: "Khám phá",
        href: productUrl({ gender: "FEMALE" }),
      },
    },
    sections: [
      {
        title: "Nổi bật",
        links: [
          { label: "Hàng mới về", href: productUrl({ gender: "FEMALE", sort: "newest" }) },
          { label: "Best Seller", href: productUrl({ gender: "FEMALE", sort: "best-selling" }) },
          { label: "Phong cách hằng ngày", href: productUrl({ gender: "FEMALE", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Giày",
        links: [
          { label: "Giày chạy bộ nữ", href: productUrl({ gender: "FEMALE", category: "Giày", keyword: "chạy bộ" }) },
          { label: "Giày training nữ", href: productUrl({ gender: "FEMALE", category: "Giày", keyword: "training" }) },
          { label: "Giày lifestyle nữ", href: productUrl({ gender: "FEMALE", category: "Giày", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Quần áo",
        links: [
          { label: "Áo bra thể thao", href: productUrl({ gender: "FEMALE", category: "Quần áo", keyword: "bra" }) },
          { label: "Legging", href: productUrl({ gender: "FEMALE", category: "Quần áo", keyword: "legging" }) },
          { label: "Áo khoác nữ", href: productUrl({ gender: "FEMALE", category: "Quần áo", keyword: "áo khoác" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Yoga", href: productUrl({ gender: "FEMALE", keyword: "yoga" }) },
          { label: "Running", href: productUrl({ gender: "FEMALE", keyword: "running" }) },
          { label: "Tất cả sản phẩm nữ", href: productUrl({ gender: "FEMALE" }) },
        ],
      },
    ],
  },
  {
    label: "Giày",
    href: productUrl({ category: "Giày" }),
    promo: {
      eyebrow: "Giày",
      title: "Mọi dòng giày bạn cần",
      description:
        "Từ chạy bộ, tập luyện đến lifestyle, chọn ngay đôi phù hợp với nhu cầu của bạn.",
      cta: {
        label: "Xem tất cả giày",
        href: productUrl({ category: "Giày" }),
      },
    },
    sections: [
      {
        title: "Theo nhu cầu",
        links: [
          { label: "Giày chạy bộ", href: productUrl({ category: "Giày", keyword: "chạy bộ" }) },
          { label: "Giày tập gym", href: productUrl({ category: "Giày", keyword: "gym" }) },
          { label: "Giày đá bóng", href: productUrl({ category: "Giày", keyword: "bóng đá" }) },
        ],
      },
      {
        title: "Theo đối tượng",
        links: [
          { label: "Giày nam", href: productUrl({ category: "Giày", gender: "MALE" }) },
          { label: "Giày nữ", href: productUrl({ category: "Giày", gender: "FEMALE" }) },
          { label: "Giày trẻ em", href: productUrl({ category: "Giày", keyword: "kids" }) },
        ],
      },
      {
        title: "Xu hướng",
        links: [
          { label: "Best Seller", href: productUrl({ category: "Giày", sort: "best-selling" }) },
          { label: "Hàng mới về", href: productUrl({ category: "Giày", sort: "newest" }) },
          { label: "Lifestyle", href: productUrl({ category: "Giày", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Giày cổ thấp", href: productUrl({ category: "Giày", keyword: "cổ thấp" }) },
          { label: "Giày cổ cao", href: productUrl({ category: "Giày", keyword: "cổ cao" }) },
          { label: "Toàn bộ giày", href: productUrl({ category: "Giày" }) },
        ],
      },
    ],
  },
  {
    label: "Quần Áo",
    href: productUrl({ category: "Quần áo" }),
    promo: {
      eyebrow: "Quần Áo",
      title: "Trang phục thể thao mỗi ngày",
      description:
        "Áo thun, quần short, áo khoác, legging và nhiều lựa chọn phù hợp mọi hoạt động.",
      cta: {
        label: "Xem tất cả quần áo",
        href: productUrl({ category: "Quần áo" }),
      },
    },
    sections: [
      {
        title: "Áo",
        links: [
          { label: "Áo thun", href: productUrl({ category: "Quần áo", keyword: "áo thun" }) },
          { label: "Áo khoác", href: productUrl({ category: "Quần áo", keyword: "áo khoác" }) },
          { label: "Áo hoodie", href: productUrl({ category: "Quần áo", keyword: "hoodie" }) },
        ],
      },
      {
        title: "Quần",
        links: [
          { label: "Quần short", href: productUrl({ category: "Quần áo", keyword: "quần short" }) },
          { label: "Jogger", href: productUrl({ category: "Quần áo", keyword: "jogger" }) },
          { label: "Legging", href: productUrl({ category: "Quần áo", keyword: "legging" }) },
        ],
      },
      {
        title: "Theo mục đích",
        links: [
          { label: "Tập luyện", href: productUrl({ category: "Quần áo", keyword: "training" }) },
          { label: "Chạy bộ", href: productUrl({ category: "Quần áo", keyword: "running" }) },
          { label: "Mặc hằng ngày", href: productUrl({ category: "Quần áo", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Quần áo nam", href: productUrl({ category: "Quần áo", gender: "MALE" }) },
          { label: "Quần áo nữ", href: productUrl({ category: "Quần áo", gender: "FEMALE" }) },
          { label: "Tất cả quần áo", href: productUrl({ category: "Quần áo" }) },
        ],
      },
    ],
  },
  {
    label: "Phụ kiện",
    href: productUrl({ category: "Phụ kiện" }),
    promo: {
      eyebrow: "Phụ kiện",
      title: "Hoàn thiện outfit của bạn",
      description:
        "Tất, nón, balo, bình nước và nhiều phụ kiện hỗ trợ tập luyện lẫn di chuyển hằng ngày.",
      cta: {
        label: "Xem phụ kiện",
        href: productUrl({ category: "Phụ kiện" }),
      },
    },
    sections: [
      {
        title: "Nổi bật",
        links: [
          { label: "Balo", href: productUrl({ category: "Phụ kiện", keyword: "balo" }) },
          { label: "Nón", href: productUrl({ category: "Phụ kiện", keyword: "nón" }) },
          { label: "Tất", href: productUrl({ category: "Phụ kiện", keyword: "tất" }) },
        ],
      },
      {
        title: "Tập luyện",
        links: [
          { label: "Bình nước", href: productUrl({ category: "Phụ kiện", keyword: "bình nước" }) },
          { label: "Găng tay", href: productUrl({ category: "Phụ kiện", keyword: "găng tay" }) },
          { label: "Túi gym", href: productUrl({ category: "Phụ kiện", keyword: "gym" }) },
        ],
      },
      {
        title: "Hằng ngày",
        links: [
          { label: "Túi đeo chéo", href: productUrl({ category: "Phụ kiện", keyword: "túi" }) },
          { label: "Ví", href: productUrl({ category: "Phụ kiện", keyword: "ví" }) },
          { label: "Phụ kiện lifestyle", href: productUrl({ category: "Phụ kiện", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Phụ kiện nam", href: productUrl({ category: "Phụ kiện", gender: "MALE" }) },
          { label: "Phụ kiện nữ", href: productUrl({ category: "Phụ kiện", gender: "FEMALE" }) },
          { label: "Tất cả phụ kiện", href: productUrl({ category: "Phụ kiện" }) },
        ],
      },
    ],
  },
  {
    label: "Sale",
    href: productUrl({ sale: "true" }),
    promo: {
      eyebrow: "Sale",
      title: "Ưu đãi đang diễn ra",
      description:
        "Chọn nhanh các sản phẩm đang giảm giá mạnh nhưng vẫn giữ phong cách và hiệu năng.",
      cta: {
        label: "Mua hàng sale",
        href: productUrl({ sale: "true" }),
      },
    },
    sections: [
      {
        title: "Theo danh mục",
        links: [
          { label: "Sale giày", href: productUrl({ sale: "true", category: "Giày" }) },
          { label: "Sale quần áo", href: productUrl({ sale: "true", category: "Quần áo" }) },
          { label: "Sale phụ kiện", href: productUrl({ sale: "true", category: "Phụ kiện" }) },
        ],
      },
      {
        title: "Theo đối tượng",
        links: [
          { label: "Sale nam", href: productUrl({ sale: "true", gender: "MALE" }) },
          { label: "Sale nữ", href: productUrl({ sale: "true", gender: "FEMALE" }) },
          { label: "Deal nổi bật", href: productUrl({ sale: "true", sort: "best-selling" }) },
        ],
      },
      {
        title: "Theo nhu cầu",
        links: [
          { label: "Running deal", href: productUrl({ sale: "true", keyword: "running" }) },
          { label: "Training deal", href: productUrl({ sale: "true", keyword: "training" }) },
          { label: "Lifestyle deal", href: productUrl({ sale: "true", keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Mới giảm giá", href: productUrl({ sale: "true", sort: "newest" }) },
          { label: "Best deal", href: productUrl({ sale: "true", sort: "price-asc" }) },
          { label: "Toàn bộ sale", href: productUrl({ sale: "true" }) },
        ],
      },
    ],
  },
  {
    label: "Tất cả sản phẩm",
    href: productUrl(),
    promo: {
      eyebrow: "Tất cả sản phẩm",
      title: "Khám phá toàn bộ cửa hàng",
      description:
        "Xem toàn bộ danh mục, lọc theo giới tính, loại sản phẩm hoặc tìm kiếm trực tiếp.",
      cta: {
        label: "Xem tất cả",
        href: productUrl(),
      },
    },
    sections: [
      {
        title: "Danh mục",
        links: [
          { label: "Giày", href: productUrl({ category: "Giày" }) },
          { label: "Quần áo", href: productUrl({ category: "Quần áo" }) },
          { label: "Phụ kiện", href: productUrl({ category: "Phụ kiện" }) },
        ],
      },
      {
        title: "Theo đối tượng",
        links: [
          { label: "Nam", href: productUrl({ gender: "MALE" }) },
          { label: "Nữ", href: productUrl({ gender: "FEMALE" }) },
          { label: "Sale", href: productUrl({ sale: "true" }) },
        ],
      },
      {
        title: "Nổi bật",
        links: [
          { label: "Hàng mới về", href: productUrl({ sort: "newest" }) },
          { label: "Best Seller", href: productUrl({ sort: "best-selling" }) },
          { label: "Phong cách hằng ngày", href: productUrl({ keyword: "lifestyle" }) },
        ],
      },
      {
        title: "Khám phá thêm",
        links: [
          { label: "Running", href: productUrl({ keyword: "running" }) },
          { label: "Gym & Training", href: productUrl({ keyword: "gym" }) },
          { label: "Toàn bộ sản phẩm", href: productUrl() },
        ],
      },
    ],
  },
];

const visibleNavItems = navItems.filter((item) => item.label !== "Tất cả sản phẩm");

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setMobileExpanded(null);
    setActiveMenu(null);
    setUserMenuOpen(false);
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
    const handleClickOutside = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const response = await getCartApi();
        const items = Array.isArray(response?.data?.items) ? response.data.items : [];
        const totalQuantity = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
        setCartCount(totalQuantity);
      } catch (error) {
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [user, location.pathname, location.search]);

  const activeMenuData = useMemo(
    () => visibleNavItems.find((item) => item.label === activeMenu),
    [activeMenu]
  );

  const orderPath = "/orders";
  const adminPath = "/admin";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = query.trim();

    if (!keyword) {
      navigate("/products");
      return;
    }

    navigate(productUrl({ keyword }));
  };

  const handleQuickSearch = (value) => {
    navigate(productUrl({ keyword: value }));
    setMobileSearchOpen(false);
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

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div
        className="relative border-b border-black/10"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="mx-auto grid h-[72px] max-w-[1840px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-3 sm:px-4 lg:px-5 xl:px-6">
          <div className="flex items-center justify-start gap-3 lg:pr-6">
            <button
              type="button"
              onClick={() => {
                setMobileOpen((prev) => !prev);
                setMobileSearchOpen(false);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100 lg:hidden"
              aria-label="Mở menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center"
            >
              <img
                src={logo}
                alt="Sportwear Logo"
                className="h-11 w-auto object-contain sm:h-12"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex lg:items-center lg:justify-center lg:gap-5 xl:gap-6">
            {visibleNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onMouseEnter={() => setActiveMenu(item.label)}
                className={`relative inline-flex h-[72px] items-center text-[15px] font-medium transition ${
                  isItemActive(item)
                    ? "text-slate-950"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-slate-950 transition-all duration-200 ${
                    isItemActive(item) || activeMenu === item.label
                      ? "w-full"
                      : "w-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1.5 sm:gap-1.5 xl:gap-2 lg:pl-8">
            <form
              onSubmit={handleSearchSubmit}
              className="hidden h-10 items-center rounded-full border border-black/10 bg-slate-50 pl-3 pr-3 lg:flex"
            >
              <SearchIcon className="h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm"
                className="h-full w-[110px] bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 xl:w-[130px]"
              />
            </form>

            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((prev) => !prev);
                setMobileOpen(false);
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100 lg:hidden"
              aria-label="Mở tìm kiếm"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100 sm:inline-flex"
              aria-label="Yêu thích"
              title="Yêu thích"
            >
              <HeartIcon />
            </button>

            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100"
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <BagIcon />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            {!user ? (
              <Link
                to="/login"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100"
                aria-label="Đăng nhập"
                title="Đăng nhập"
              >
                <UserIcon />
              </Link>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-900 transition hover:bg-slate-100"
                  aria-label={user.fullName || "Tài khoản"}
                  title={user.fullName || "Tài khoản"}
                >
                  <UserIcon />
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[180px] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {user.fullName || "Tài khoản"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {user.roleName === "ADMIN" ? "Quản trị viên" : "Tài khoản khách hàng"}
                      </p>
                    </div>

                    <div className="mt-1 space-y-1">
                      {user.roleName === "ADMIN" ? (
                        <Link
                          to={adminPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          Quản lý
                        </Link>
                      ) : (
                        <Link
                          to={orderPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          Đơn hàng của tôi
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {activeMenuData && (
          <div className="absolute inset-x-0 top-full hidden border-t border-black/10 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:block">
            <div className="mx-auto max-w-[1760px] px-4 py-8 sm:px-5 lg:px-6 xl:px-8">
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {activeMenuData.promo.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                    {activeMenuData.promo.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {activeMenuData.promo.description}
                  </p>

                  <Link
                    to={activeMenuData.promo.cta.href}
                    className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    {activeMenuData.promo.cta.label}
                  </Link>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                  {activeMenuData.sections.map((section) => (
                    <div key={section.title}>
                      <p className="text-sm font-semibold text-slate-950">
                        {section.title}
                      </p>

                      <div className="mt-4 space-y-3">
                        {section.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.href}
                            className="block text-sm text-slate-600 transition hover:text-slate-950"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {mobileSearchOpen && (
        <div className="border-b border-black/10 bg-white lg:hidden">
          <div className="mx-auto max-w-[1760px] px-4 py-4 sm:px-5 lg:px-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
              <div className="flex h-12 items-center rounded-full bg-slate-100 px-4">
                <SearchIcon className="h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm"
                  className="h-full flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white"
              >
                Tìm kiếm
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="border-b border-black/10 bg-white lg:hidden">
          <div className="mx-auto max-w-[1760px] px-4 py-4 sm:px-5 lg:px-6">
            <div className="space-y-3">
              {visibleNavItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-4">
                    <Link
                      to={item.href}
                      className="text-base font-semibold text-slate-950"
                    >
                      {item.label}
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpanded((prev) =>
                          prev === item.label ? null : item.label
                        )
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                      aria-label={`Mở menu ${item.label}`}
                    >
                      <ChevronDownIcon
                        className={`h-5 w-5 transition ${
                          mobileExpanded === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {mobileExpanded === item.label && (
                    <div className="border-t border-slate-200 bg-slate-50 p-4">
                      <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.promo.eyebrow}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.promo.description}
                        </p>
                      </div>

                      <div className="space-y-5">
                        {item.sections.map((section) => (
                          <div key={section.title}>
                            <p className="text-sm font-semibold text-slate-950">
                              {section.title}
                            </p>
                            <div className="mt-3 space-y-2">
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  to={link.href}
                                  className="block text-sm text-slate-600"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-2">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900"
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={user.roleName === "ADMIN" ? "/admin" : "/orders"}
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      {user.roleName === "ADMIN" ? "Quản trị" : "Đơn hàng"}
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const MenuIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
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
);

const HeartIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12 20.25-.45-.42C6.75 15.36 3.75 12.6 3.75 8.97c0-2.97 2.33-5.22 5.25-5.22 1.65 0 3.24.75 4.2 1.95.96-1.2 2.55-1.95 4.2-1.95 2.92 0 5.25 2.25 5.25 5.22 0 3.63-3 6.39-7.8 10.86L12 20.25Z"
    />
  </svg>
);

const BagIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6.75a3.75 3.75 0 1 0-7.5 0v3.75m-3 0h13.5l-.9 9a2.25 2.25 0 0 1-2.238 2.025H8.388A2.25 2.25 0 0 1 6.15 19.5l-.9-9Z"
    />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a8.25 8.25 0 0 1 14.998 0"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export default Header;