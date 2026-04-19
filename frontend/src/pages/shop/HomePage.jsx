import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { getSportsApi } from "../../services/sportService";
import { getProductsApi } from "../../services/productService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const HERO_IMAGE = "/images/home/banner11.png";
const HEADER_HEIGHT = 64;
const PROMOTION_BAR_HEIGHT = 56;
const PROMOTION_ROTATE_MS = 5000;
const TOP_THRESHOLD = 16;

const fallbackSpotlightItems = [
  {
    id: 1,
    image: "/images/campaign-shoes.jpg",
    tag: "12 sản phẩm",
    title: "Nike",
    description:
      "Khám phá bộ sưu tập thể thao nổi bật với tinh thần hiện đại, mạnh mẽ và linh hoạt cho mọi chuyển động.",
    link: "/products",
  },
  {
    id: 2,
    image: "/images/campaign-basketball.jpg",
    tag: "10 sản phẩm",
    title: "Adidas",
    description:
      "Thiết kế hiệu suất cao, tối ưu cho vận động hàng ngày từ tập luyện đến phong cách thể thao đường phố.",
    link: "/products",
  },
  {
    id: 3,
    image: "/images/campaign-wellness.jpg",
    tag: "8 sản phẩm",
    title: "Puma",
    description:
      "Phong cách năng động với chất liệu thoải mái, phù hợp cho nhiều bộ môn và nhịp sống hiện đại.",
    link: "/products",
  },
];

const campaignItems = [
  {
    id: 1,
    image: "/images/home/campaign1.jpg",
    title: "KHÔNG NGỪNG BỎ CUỘC",
    textClass: "text-white",
    link: "/products",
  },
  {
    id: 2,
    image: "/images/home/campaign2.jpg",
    title: "THỂ HIỆN CÁ TÍNH",
    textClass: "text-white",
    link: "/products",
  },
];

const fallbackSports = [
  { id: "running", name: "Running", productCount: 11 },
  { id: "football", name: "Football", productCount: 14 },
  { id: "gym", name: "Gym", productCount: 9 },
  { id: "yoga", name: "Yoga", productCount: 8 },
  { id: "basketball", name: "Basketball", productCount: 12 },
  { id: "tennis", name: "Tennis", productCount: 7 },
  { id: "badminton", name: "Badminton", productCount: 10 },
  { id: "training", name: "Training", productCount: 13 },
  { id: "lifestyle", name: "Lifestyle", productCount: 6 },
];

const sportImageMap = {
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  running:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
  gym: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  yoga:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  tennis:
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80",
  badminton:
    "https://images.unsplash.com/photo-1613918431703-aa508ccad4b8?auto=format&fit=crop&w=1200&q=80",
  basketball:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  training:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  lifestyle:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
};

function resolveSportImageByName(name = "") {
  const normalized = String(name).trim().toLowerCase();
  return (
    sportImageMap[normalized] ||
    Object.entries(sportImageMap).find(([key]) => normalized.includes(key))?.[1] ||
    sportImageMap.default
  );
}

function resolveSportCardImage(sport) {
  if (sport?.imageUrl) {
    return resolveImageUrl(sport.imageUrl);
  }

  return resolveSportImageByName(sport?.name);
}

function isPromotionAvailable(promotion, now = new Date()) {
  if (!promotion || promotion.isActive === false) return false;

  if (
    promotion.status &&
    !["ACTIVE", "SCHEDULED"].includes(String(promotion.status).toUpperCase())
  ) {
    return false;
  }

  const startTime = promotion.startTime ? new Date(promotion.startTime) : null;
  const endTime = promotion.endTime ? new Date(promotion.endTime) : null;

  if (startTime && Number.isFinite(startTime.getTime()) && now < startTime) return false;
  if (endTime && Number.isFinite(endTime.getTime()) && now > endTime) return false;

  return true;
}

function formatPromotionHeadline(promotion) {
  if (!promotion) return "";

  const discountValue = Number(promotion.discountValue);
  const discountText = Number.isFinite(discountValue)
    ? promotion.discountType === "PERCENT"
      ? `Giảm ${discountValue}%`
      : promotion.discountType === "FIXED_AMOUNT"
      ? `Giảm ${discountValue.toLocaleString("vi-VN")}đ`
      : promotion.discountType === "FIXED_PRICE"
      ? `Chỉ còn ${discountValue.toLocaleString("vi-VN")}đ`
      : ""
    : "";

  if (discountText) {
    return `${promotion.name} • ${discountText}`;
  }

  return promotion.name || "Ưu đãi nổi bật";
}

function resolveSportProductCount(sport) {
  if (!sport) return null;

  const countCandidates = [
    sport.productCount,
    sport.productsCount,
    sport.totalProducts,
    sport.totalProduct,
    sport.productTotal,
    sport.totalItems,
    sport.itemCount,
  ];

  for (const candidate of countCandidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  if (Array.isArray(sport.products)) {
    return sport.products.length;
  }

  return null;
}

function resolveBrandImage(brand) {
  const dynamicImage =
    brand?.bannerImageUrl ||
    brand?.coverImageUrl ||
    brand?.imageUrl ||
    brand?.logoUrl;

  if (dynamicImage) {
    return resolveImageUrl(dynamicImage);
  }

  return "/images/campaign-shoes.jpg";
}

function resolveBrandDescription(brand) {
  if (brand?.description && String(brand.description).trim()) {
    return brand.description;
  }

  return "Khám phá bộ sưu tập nổi bật của thương hiệu này trên Sportwear Shop.";
}

function formatCurrency(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return `${number.toLocaleString("vi-VN")}đ`;
}

function resolveProductPrice(product) {
  const priorityPrices = [
    product?.flashSalePrice,
    product?.promotionPrice,
    product?.salePrice,
    product?.finalPrice,
    product?.minPrice,
    product?.price,
  ];

  for (const candidate of priorityPrices) {
    const formatted = formatCurrency(candidate);
    if (formatted) return formatted;
  }

  const minPrice = Number(product?.minPrice);
  const maxPrice = Number(product?.maxPrice);

  if (
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice > 0 &&
    maxPrice > 0
  ) {
    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString("vi-VN")}đ`;
    }
    return `Từ ${minPrice.toLocaleString("vi-VN")}đ`;
  }

  return "Liên hệ";
}

function resolveProductImage(product) {
  const dynamicImage =
    product?.thumbnailUrl || product?.imageUrl || product?.thumbnail;

  if (dynamicImage) {
    return resolveImageUrl(dynamicImage);
  }

  return "/images/campaign-shoes.jpg";
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-10 w-10"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function HomePage() {
  const [sports, setSports] = useState([]);
  const [sportsError, setSportsError] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [promotionIndex, setPromotionIndex] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [topBrands, setTopBrands] = useState([]);
  const [brandsError, setBrandsError] = useState(false);
  const [newProducts, setNewProducts] = useState([]);
  const [newProductsLoading, setNewProductsLoading] = useState(true);

  const sportsRailRef = useRef(null);
  const productRailRef = useRef(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await getSportsApi();
        setSports(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Không thể tải danh sách môn thể thao", error);
        setSportsError(true);
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setNewProductsLoading(true);

        const response = await getProductsApi({
          page: 0,
          size: 8,
          sort: "newest",
        });

        const data = response?.data || {};
        setNewProducts(Array.isArray(data.content) ? data.content : []);
      } catch (error) {
        console.error("Không thể tải sản phẩm mới", error);
        setNewProducts([]);
      } finally {
        setNewProductsLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const [activeResponse, fallbackResponse] = await Promise.allSettled([
          axiosClient.get("/api/promotions/active"),
          axiosClient.get("/api/promotions"),
        ]);

        const activeData =
          activeResponse.status === "fulfilled" &&
          Array.isArray(activeResponse.value?.data)
            ? activeResponse.value.data
            : null;

        const fallbackData =
          fallbackResponse.status === "fulfilled" &&
          Array.isArray(fallbackResponse.value?.data)
            ? fallbackResponse.value.data
            : null;

        const rawPromotions = activeData || fallbackData || [];
        const now = new Date();

        const availablePromotions = rawPromotions
          .filter((promotion) => isPromotionAvailable(promotion, now))
          .sort((a, b) => (Number(b?.priority) || 0) - (Number(a?.priority) || 0));

        setPromotions(availablePromotions);
      } catch (error) {
        console.warn("Không thể tải promotion cho homepage", error);
        setPromotions([]);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchTopBrands = async () => {
      try {
        const response = await axiosClient.get("/api/brands/top?limit=3");
        const data = Array.isArray(response?.data) ? response.data : [];
        setTopBrands(data);
      } catch (error) {
        console.warn("Không thể tải top thương hiệu", error);
        setBrandsError(true);
        setTopBrands([]);
      }
    };

    fetchTopBrands();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= TOP_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) {
      setPromotionIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPromotionIndex((prev) => (prev + 1) % promotions.length);
    }, PROMOTION_ROTATE_MS);

    return () => window.clearInterval(intervalId);
  }, [promotions]);

  const displaySports = useMemo(() => {
    if (sports.length > 0) return sports;
    return fallbackSports;
  }, [sports]);

  const activePromotion = promotions[promotionIndex] || null;
  const showPromotionBar = isAtTop && promotions.length > 0;
  const heroHeight = `calc(100vh - ${
    HEADER_HEIGHT + (promotions.length > 0 ? PROMOTION_BAR_HEIGHT : 0)
  }px)`;
  const sectionOuterClass =
    "px-3 py-16 sm:px-4 sm:py-20 lg:px-5 lg:py-24 xl:px-6";
  const sectionInnerClass = "mx-auto w-full max-w-[1760px]";

  const spotlightBrands = useMemo(() => {
    if (!topBrands.length) return fallbackSpotlightItems;

    return topBrands.map((brand) => ({
      id: brand.id,
      image: resolveBrandImage(brand),
      tag: `${Number(brand.productCount) || 0} sản phẩm`,
      title: brand.name || "Thương hiệu nổi bật",
      description: resolveBrandDescription(brand),
      link:
        typeof brand.id === "number"
          ? `/products?brandId=${brand.id}`
          : "/products",
    }));
  }, [topBrands]);

  const scrollSports = (direction) => {
    if (!sportsRailRef.current) return;

    const firstCard = sportsRailRef.current.querySelector('[data-sport-card="true"]');
    const scrollAmount = firstCard ? firstCard.clientWidth + 24 : 320;

    sportsRailRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollProducts = (direction) => {
    if (!productRailRef.current) return;
    productRailRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    window.setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="w-full bg-white text-black">
      <div
        className={`sticky top-0 z-30 overflow-hidden bg-zinc-200 text-black transition-[max-height,opacity,transform] duration-300 ${
          showPromotionBar
            ? "max-h-[72px] translate-y-0 opacity-100"
            : "max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <div
          className="flex items-center justify-center px-4 text-center sm:px-6 lg:px-8"
          style={{ height: `${PROMOTION_BAR_HEIGHT}px` }}
        >
          {activePromotion ? (
            <div className="flex w-full max-w-6xl items-center justify-center gap-3">
              <p className="line-clamp-1 text-sm font-semibold tracking-[0.01em] text-black sm:text-base">
                {formatPromotionHeadline(activePromotion)}
              </p>
              {promotions.length > 1 ? (
                <span className="hidden text-xs text-black/55 sm:inline-flex">
                  {promotionIndex + 1}/{promotions.length}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <section
        className="relative overflow-hidden bg-white"
        style={{ minHeight: heroHeight }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div
          className="relative flex items-end justify-center px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28 xl:px-10"
          style={{ minHeight: heroHeight }}
        >
          <Link
            to="/products"
            className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition duration-300 hover:bg-zinc-300 sm:px-7 sm:py-3"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      <section className={`bg-white ${sectionOuterClass}`}>
        <div className={sectionInnerClass}>
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl text-black sm:text-2xl lg:text-2xl">
                Mua sắm theo môn thể thao
              </h2>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => scrollSports("left")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-zinc-800"
                aria-label="Trượt môn thể thao sang trái"
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => scrollSports("right")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-zinc-800"
                aria-label="Trượt môn thể thao sang phải"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>

          <div
            ref={sportsRailRef}
            className="flex gap-6 overflow-x-auto pb-4 pr-6 [scrollbar-width:none] snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {displaySports.map((sport) => (
              <Link
                key={sport.id}
                to={
                  typeof sport.id === "number"
                    ? `/products?sportId=${sport.id}`
                    : "/products"
                }
                data-sport-card="true"
                className="group relative block w-[82%] flex-shrink-0 snap-start sm:w-[70%] md:w-[48%] xl:w-[31%]"
              >
                <div className="aspect-[4/5] overflow-hidden bg-zinc-200">
                  <img
                    src={resolveSportCardImage(sport)}
                    alt={sport.name}
                    className="h-full w-full object-cover transition duration-500"
                  />
                </div>
                <div className="pt-4">
                  <p className="text-2xl uppercase tracking-[0.08em] sm:text-2xl">
                    {sport.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {sportsError && sports.length === 0 ? (
            <p className="mt-5 text-sm text-zinc-500">
              Không tải được môn thể thao từ API, đang hiển thị dữ liệu giao diện
              dự phòng.
            </p>
          ) : null}
        </div>
      </section>

      <section className={`bg-white ${sectionOuterClass}`}>
        <div className={sectionInnerClass}>
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">
              Nổi bật
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {spotlightBrands.map((item) => (
              <Link key={item.id} to={item.link} className="group block">
                <div className="relative mb-6 overflow-hidden bg-zinc-100 md:h-96 lg:h-[500px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-auto w-full object-contain transition duration-500 md:h-full md:w-full md:object-cover"
                  />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-black sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mb-3 text-sm font-semibold text-zinc-500">
                  {item.tag}
                </p>
                <p className="text-sm leading-7 text-zinc-600 sm:text-base">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-semibold text-black transition group-hover:translate-x-1">
                  Khám phá →
                </span>
              </Link>
            ))}
          </div>

          {brandsError && topBrands.length === 0 ? (
            <p className="mt-5 text-center text-sm text-zinc-500">
              Không tải được dữ liệu thương hiệu từ API, đang hiển thị nội dung
              giao diện dự phòng.
            </p>
          ) : null}
        </div>
      </section>

          
      <section className="bg-white px-0 py-0">
        <div className="w-full">
          <div
            className="grid grid-cols-1 gap-0 md:grid-cols-2"
            style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
          >
            {campaignItems.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group relative block w-full overflow-hidden aspect-[4/5] md:h-full md:aspect-auto"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500"
                />

                <div
                  className={`absolute inset-0 ${item.overlay} transition duration-500`}
                />

                <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-10">
                  <div>
                    <h3
                      className={`text-3xl font-black uppercase sm:text-3xl lg:text-3xl ${item.textClass}`}
                    >
                      {item.title}
                    </h3>
                    <p className={`mt-2 text-sm sm:text-base lg:text-lg ${item.textClass}/90`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={` ${sectionOuterClass}`}>
        <div className={sectionInnerClass}>
          <div className="mb-12 flex items-end justify-between gap-6 sm:mb-16">
            <div>
              <h2 className="text-3xl font-black text-black sm:text-4xl lg:text-5xl">
                Sản phẩm mới
              </h2>
            </div>
            <div className="hidden gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollProducts("left")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-zinc-800"
                aria-label="Cuộn trái"
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => scrollProducts("right")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-zinc-800"
                aria-label="Cuộn phải"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>

          {newProductsLoading ? (
            <div
              ref={productRailRef}
              className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
              style={{ scrollbarWidth: "none" }}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="block w-64 flex-shrink-0 sm:w-80">
                  <div className="relative mb-4 h-64 animate-pulse overflow-hidden bg-zinc-200 sm:h-80" />
                  <div className="h-5 w-3/4 animate-pulse bg-zinc-200" />
                  <div className="mt-2 h-4 w-28 animate-pulse bg-zinc-200" />
                  <div className="mt-4 h-12 animate-pulse rounded-xl bg-zinc-200" />
                </div>
              ))}
            </div>
          ) : newProducts.length === 0 ? (
            <div className="bg-white px-6 py-12 text-center text-zinc-500">
              Chưa có sản phẩm mới để hiển thị.
            </div>
          ) : (
            <div
              ref={productRailRef}
              className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
              style={{ scrollbarWidth: "none" }}
            >
              {newProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group flex w-64 flex-shrink-0 flex-col sm:w-80"
                >
                  <div className="relative mb-4 h-64 overflow-hidden bg-zinc-200 sm:h-80">
                    <img
                      src={resolveProductImage(product)}
                      alt={product?.name || "Sản phẩm"}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  </div>

                  <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold text-black sm:min-h-[3.5rem] sm:text-lg">
                    {product?.name || "Sản phẩm"}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-zinc-600 sm:text-base">
                    {resolveProductPrice(product)}
                  </p>

                  <span className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:text-base">
                    Xem sản phẩm
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`bg-black text-white ${sectionOuterClass}`}>
        <div className="mx-auto w-full max-w-[1120px] text-center">
          <div className="mb-4 flex justify-center text-white">
            <MailIcon />
          </div>
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
            Nhận tin khuyến mãi
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Đăng ký để nhận thông tin về bộ sưu tập mới, ưu đãi nổi bật và cảm
            hứng thời trang thể thao mỗi tuần.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nhập email của bạn"
              className="h-14 w-full rounded-full border border-white/15 bg-white px-6 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-white sm:text-base"
            />
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:text-base"
            >
              Đăng ký
            </button>
          </form>

          {submitted ? (
            <p className="mt-4 text-sm text-emerald-300">
              Đăng ký thành công. Cảm ơn bạn đã quan tâm.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default HomePage;