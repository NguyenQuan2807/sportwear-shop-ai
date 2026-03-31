import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getSportsApi } from "../../services/sportService";

// Khi bạn có video thật, chỉ cần import vào đây:
// import heroVideo from "../../assets/home-hero.mp4";

const heroVideo = ""; // sau này thay bằng file video thật của bạn
const heroFallbackImage =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80";

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
  default:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
};

const featuredBrands = [
  {
    name: "Nike",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    link: "/products?brand=Nike",
  },
  {
    name: "Adidas",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
    link: "/products?brand=Adidas",
  },
  {
    name: "Puma",
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
    link: "/products?brand=Puma",
  },
  {
    name: "Under Armour",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    link: "/products?brand=Under Armour",
  },
];

const editorialSections = [
  {
    title: "Built for speed",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1800&q=80",
    link: "/products",
    height: "tall",
  },
  {
    title: "Train with intent",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=80",
    link: "/products",
    height: "medium",
  },
  {
    title: "Move in style",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80",
    link: "/products",
    height: "medium",
  },
];

const HomePage = () => {
  const [sports, setSports] = useState([]);
  const sportsRailRef = useRef(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await getSportsApi();
        setSports(response.data || []);
      } catch (error) {
        console.error("Không thể tải danh sách môn thể thao", error);
      }
    };

    fetchSports();
  }, []);

  const scrollSports = (direction) => {
    if (!sportsRailRef.current) return;

    sportsRailRef.current.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-black text-white">
      {/* HERO VIDEO */}
      <section className="relative min-h-screen overflow-hidden">
        {heroVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={heroFallbackImage}
            alt="Hero"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative flex min-h-screen items-end">
          <div className="w-full px-6 pb-10 sm:px-10 sm:pb-14 lg:px-16 lg:pb-16">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-slate-100"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY SPORT */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Shop by sport
          </h2>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollSports("left")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => scrollSports("right")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <div
          ref={sportsRailRef}
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth py-2"
        >
          {sports.map((sport) => (
            <Link
              key={sport.id}
              to={`/products?sportId=${sport.id}`}
              className="group flex min-w-[110px] flex-col items-center sm:min-w-[120px] lg:min-w-[140px]"
            >
              <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-zinc-900 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                <img
                  src={resolveSportImage(sport.name)}
                  alt={sport.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <p className="mt-3 text-center text-sm font-bold tracking-tight text-white sm:text-base">
                {sport.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 LARGE SQUARES */}
      <section className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredBrands.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="group relative overflow-hidden rounded-[24px] bg-zinc-900"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <LinkButton label="Xem sản phẩm" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL BANNERS */}
      <section className="px-0 py-12 lg:py-16">
        <div className="grid gap-0 md:grid-cols-3 md:h-[78vh]">
          {editorialSections.map((section) => (
            <Link
              key={section.title}
              to={section.link}
              className="group relative block overflow-hidden bg-zinc-900"
            >
              <div className="relative min-h-[320px] md:h-full">
                <img
                  src={section.image}
                  alt={section.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                  <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {section.title}
                  </h3>

                  <div className="mt-5">
                    <LinkButton label="Xem sản phẩm" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const LinkButton = ({ label }) => (
  <span className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition group-hover:bg-slate-100">
    {label}
  </span>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
  </svg>
);

function resolveSportImage(name = "") {
  const normalized = String(name).trim().toLowerCase();

  return (
    sportImageMap[normalized] ||
    Object.entries(sportImageMap).find(([key]) => normalized.includes(key))?.[1] ||
    sportImageMap.default
  );
}

export default HomePage;