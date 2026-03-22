import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";

const heroSlides = [
  {
    id: 1,
    tag: "New Season",
    title: "Thời trang thể thao hiện đại cho phong cách năng động",
    description:
      "Khám phá giày, quần áo và phụ kiện thể thao với thiết kế mạnh mẽ, thoải mái và tối ưu hiệu suất.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
    primaryLink: "/products",
    secondaryLink: "/products?sort=newest",
  },
  {
    id: 2,
    tag: "Flash Sale",
    title: "Deal hot mỗi ngày — săn ưu đãi lên đến 50%",
    description:
      "Các sản phẩm nổi bật được cập nhật liên tục, số lượng có hạn, chốt đơn thật nhanh trước khi hết hàng.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
    primaryLink: "/products?promotion=flash-sale",
    secondaryLink: "/products?sort=popular",
  },
  {
    id: 3,
    tag: "AI Assistant",
    title: "Tìm sản phẩm nhanh hơn với trải nghiệm mua sắm thông minh",
    description:
      "Website tích hợp AI chatbot hỗ trợ gợi ý sản phẩm, tư vấn nhu cầu và đồng hành trong quá trình mua hàng.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    primaryLink: "/products",
    secondaryLink: "/login",
  },
];

const featuredCategories = [
  {
    title: "Giày",
    description: "Giày chạy bộ, gym, bóng đá với thiết kế linh hoạt và bền bỉ.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    link: "/products?category=Giày",
  },
  {
    title: "Quần áo",
    description: "Áo, quần, set đồ tập hiện đại, thoáng khí và tôn dáng.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    link: "/products?category=Quần áo",
  },
  {
    title: "Phụ kiện",
    description: "Túi, nón, tất, bình nước và nhiều phụ kiện thể thao tiện dụng.",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    link: "/products?category=Phụ kiện",
  },
];

const buildProduct = ({
  id,
  name,
  sportName,
  brandName,
  categoryName,
  gender,
  thumbnailUrl,
  minPrice,
  maxPrice,
  saleMinPrice,
  saleMaxPrice,
  discount = 0,
  onPromotion = false,
  flashSale = false,
}) => ({
  id,
  name,
  sportName,
  brandName,
  categoryName,
  gender,
  thumbnailUrl,
  minPrice,
  maxPrice,
  originalMinPrice: onPromotion ? minPrice : null,
  originalMaxPrice: onPromotion ? maxPrice : null,
  saleMinPrice: onPromotion ? saleMinPrice : null,
  saleMaxPrice: onPromotion ? saleMaxPrice : null,
  onPromotion,
  flashSale,
  maxDiscountPercent: discount,
  isActive: true,
  inStock: true,
});

const flashSaleProducts = [
  buildProduct({
    id: 101,
    name: "Giày Running Sprint Pro",
    sportName: "Running",
    brandName: "Nike",
    categoryName: "Giày",
    gender: "UNISEX",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    minPrice: 2590000,
    maxPrice: 2590000,
    saleMinPrice: 1890000,
    saleMaxPrice: 1890000,
    discount: 27,
    onPromotion: true,
    flashSale: true,
  }),
  buildProduct({
    id: 102,
    name: "Áo Training Dry-Fit Elite",
    sportName: "Gym",
    brandName: "Adidas",
    categoryName: "Quần áo",
    gender: "MALE",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    minPrice: 890000,
    maxPrice: 890000,
    saleMinPrice: 690000,
    saleMaxPrice: 690000,
    discount: 22,
    onPromotion: true,
    flashSale: true,
  }),
  buildProduct({
    id: 103,
    name: "Balo Sport Utility",
    sportName: "Training",
    brandName: "Puma",
    categoryName: "Phụ kiện",
    gender: "UNISEX",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&q=80",
    minPrice: 990000,
    maxPrice: 990000,
    saleMinPrice: 790000,
    saleMaxPrice: 790000,
    discount: 20,
    onPromotion: true,
    flashSale: true,
  }),
  buildProduct({
    id: 104,
    name: "Quần Short Flex Move",
    sportName: "Training",
    brandName: "Under Armour",
    categoryName: "Quần áo",
    gender: "FEMALE",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506629905607-bb5e54178d8d?auto=format&fit=crop&w=900&q=80",
    minPrice: 790000,
    maxPrice: 790000,
    saleMinPrice: 590000,
    saleMaxPrice: 590000,
    discount: 25,
    onPromotion: true,
    flashSale: true,
  }),
];

const tabProducts = {
  new: [
    buildProduct({
      id: 201,
      name: "Giày Court Motion",
      sportName: "Tennis",
      brandName: "Nike",
      categoryName: "Giày",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
      minPrice: 2190000,
      maxPrice: 2190000,
    }),
    buildProduct({
      id: 202,
      name: "Áo Polo Tennis Air",
      sportName: "Tennis",
      brandName: "Adidas",
      categoryName: "Quần áo",
      gender: "MALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      minPrice: 1190000,
      maxPrice: 1190000,
    }),
    buildProduct({
      id: 203,
      name: "Túi Duffel Active Pack",
      sportName: "Training",
      brandName: "Puma",
      categoryName: "Phụ kiện",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80",
      minPrice: 1290000,
      maxPrice: 1290000,
    }),
    buildProduct({
      id: 204,
      name: "Áo Crop Top Motion",
      sportName: "Yoga",
      brandName: "Lululemon",
      categoryName: "Quần áo",
      gender: "FEMALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1506629905607-bb5e54178d8d?auto=format&fit=crop&w=900&q=80",
      minPrice: 990000,
      maxPrice: 990000,
    }),
  ],
  bestSeller: [
    buildProduct({
      id: 205,
      name: "Giày Football Speed X",
      sportName: "Football",
      brandName: "Nike",
      categoryName: "Giày",
      gender: "MALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
      minPrice: 2690000,
      maxPrice: 2690000,
      saleMinPrice: 2290000,
      saleMaxPrice: 2290000,
      discount: 15,
      onPromotion: true,
    }),
    buildProduct({
      id: 206,
      name: "Áo Gym Compression Pro",
      sportName: "Gym",
      brandName: "Under Armour",
      categoryName: "Quần áo",
      gender: "MALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      minPrice: 1090000,
      maxPrice: 1090000,
    }),
    buildProduct({
      id: 207,
      name: "Bình nước Active Flow",
      sportName: "Training",
      brandName: "Adidas",
      categoryName: "Phụ kiện",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
      minPrice: 390000,
      maxPrice: 390000,
    }),
    buildProduct({
      id: 208,
      name: "Giày Run Max Cushion",
      sportName: "Running",
      brandName: "Asics",
      categoryName: "Giày",
      gender: "FEMALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
      minPrice: 2990000,
      maxPrice: 2990000,
    }),
  ],
  featured: [
    buildProduct({
      id: 209,
      name: "Set Training Signature",
      sportName: "Training",
      brandName: "Puma",
      categoryName: "Quần áo",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      minPrice: 1890000,
      maxPrice: 1890000,
      saleMinPrice: 1490000,
      saleMaxPrice: 1490000,
      discount: 21,
      onPromotion: true,
    }),
    buildProduct({
      id: 210,
      name: "Giày Trail Adventure",
      sportName: "Running",
      brandName: "Salomon",
      categoryName: "Giày",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
      minPrice: 3290000,
      maxPrice: 3290000,
    }),
    buildProduct({
      id: 211,
      name: "Mũ lưỡi trai Sport Core",
      sportName: "Training",
      brandName: "Nike",
      categoryName: "Phụ kiện",
      gender: "UNISEX",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
      minPrice: 490000,
      maxPrice: 490000,
    }),
    buildProduct({
      id: 212,
      name: "Áo khoác Wind Runner",
      sportName: "Running",
      brandName: "Adidas",
      categoryName: "Quần áo",
      gender: "FEMALE",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      minPrice: 1790000,
      maxPrice: 1790000,
    }),
  ],
};

const promoBanners = [
  {
    title: "Giày chạy bộ hiệu năng cao",
    description: "Thiết kế êm ái, phản hồi tốt cho từng bước chạy.",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
    link: "/products?category=Giày&sport=Running",
  },
  {
    title: "Đồ tập gym cho mọi cường độ",
    description: "Co giãn, thoáng khí, tối ưu chuyển động.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    link: "/products?sport=Gym",
  },
  {
    title: "Phụ kiện đồng hành mỗi buổi tập",
    description: "Nhỏ gọn, hữu dụng, nâng cấp trải nghiệm luyện tập.",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
    link: "/products?category=Phụ kiện",
  },
];

const blogPosts = [
  {
    id: 1,
    title: "Cách chọn giày chạy bộ phù hợp cho người mới bắt đầu",
    description:
      "Những tiêu chí quan trọng khi chọn giày chạy: độ êm, form chân, cự ly và địa hình.",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "5 outfit thể thao vừa đẹp vừa thoải mái cho mùa hè",
    description:
      "Gợi ý phối đồ thể thao hiện đại giúp bạn tự tin khi tập luyện và dạo phố.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Phụ kiện nhỏ nhưng giúp buổi tập hiệu quả hơn rất nhiều",
    description:
      "Từ bình nước, tất thể thao đến túi tập — những món đồ đáng đầu tư cho trải nghiệm tốt hơn.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  },
];

const formatTime = (time) => String(time).padStart(2, "0");

const SectionHeader = ({ eyebrow, title, description, actionLabel, actionLink }) => (
  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>

    {actionLabel && actionLink && (
      <Link
        to={actionLink}
        className="inline-flex w-fit items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);

const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("new");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  const activeProducts = useMemo(() => tabProducts[activeTab] || [], [activeTab]);

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
        <div className="relative h-[520px] sm:h-[600px]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ${
                index === activeSlide
                  ? "opacity-100 scale-100"
                  : "pointer-events-none opacity-0 scale-[1.02]"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

              <div className="relative flex h-full items-center">
                <div className="w-full px-6 sm:px-10 lg:px-14">
                  <div className="max-w-2xl text-white">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur">
                      {slide.tag}
                    </span>

                    <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                      {slide.description}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={slide.primaryLink}
                        className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-600"
                      >
                        Mua ngay
                      </Link>

                      <Link
                        to={slide.secondaryLink}
                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                      >
                        Xem sản phẩm
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 left-6 flex items-center gap-2 sm:left-10 lg:left-14">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-10 bg-white" : "w-2.5 bg-white/40"
                }`}
                aria-label={`Chọn slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Danh mục nổi bật"
          title="Khám phá theo nhu cầu mua sắm"
          description="Đi nhanh tới nhóm sản phẩm bạn cần với các danh mục chính được ưu tiên hiển thị."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.title}
              to={category.link}
              className="group relative overflow-hidden rounded-[28px] bg-slate-900"
            >
              <div className="relative h-[320px]">
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-black">{category.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    {category.description}
                  </p>
                  <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                    Khám phá ngay
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-red-600 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Flash Sale
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Ưu đãi giới hạn thời gian
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
              Những sản phẩm hot đang được giảm giá mạnh. Số lượng có hạn và sẽ
              quay về giá thường khi chương trình kết thúc.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <TimeBox label="Giờ" value={formatTime(timeLeft.hours)} />
            <TimeBox label="Phút" value={formatTime(timeLeft.minutes)} />
            <TimeBox label="Giây" value={formatTime(timeLeft.seconds)} />
            <TimeBox label="Ngày" value={formatTime(timeLeft.days)} />
          </div>
        </div>

        <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2 snap-x snap-mandatory">
          {flashSaleProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] snap-start sm:min-w-[320px] lg:min-w-[340px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Sản phẩm"
          title="Chọn nhanh theo nhóm nổi bật"
          description="Chuyển tab để xem nhóm sản phẩm mong muốn mà không cần tải lại trang."
          actionLabel="Xem tất cả"
          actionLink="/products"
        />

        <div className="mb-8 flex flex-wrap gap-3">
          <TabButton
            active={activeTab === "new"}
            onClick={() => setActiveTab("new")}
            label="Sản phẩm mới"
          />
          <TabButton
            active={activeTab === "bestSeller"}
            onClick={() => setActiveTab("bestSeller")}
            label="Bán chạy"
          />
          <TabButton
            active={activeTab === "featured"}
            onClick={() => setActiveTab("featured")}
            label="Nổi bật"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {activeProducts.map((product) => (
            <ProductCard key={`${activeTab}-${product.id}`} product={product} />
          ))}
        </div>
      </section>

      <section>
        <div className="grid gap-6 lg:grid-cols-3">
          {promoBanners.map((banner, index) => (
            <Link
              key={banner.title}
              to={banner.link}
              className={`group relative overflow-hidden rounded-[28px] ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="relative h-[260px]">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />

                <div className="absolute inset-0 flex items-end p-6 text-white">
                  <div className="max-w-md">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                      Promo Banner
                    </p>
                    <h3 className="text-2xl font-black">{banner.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {banner.description}
                    </p>
                    <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                      Mua ngay
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Blog / Tin tức"
          title="Cập nhật xu hướng và mẹo chọn đồ thể thao"
          description="Section này giúp trang chủ của bạn trông hoàn chỉnh hơn, đồng thời tăng điểm đồ án khi demo."
          actionLabel="Xem thêm"
          actionLink="/products"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-[28px] bg-white shadow-lg ring-1 ring-slate-200/60"
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  Sportwear Blog
                </p>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {post.description}
                </p>

                <button
                  type="button"
                  className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Đọc tiếp
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const TimeBox = ({ label, value }) => (
  <div className="rounded-2xl bg-white/10 px-4 py-4 text-center backdrop-blur">
    <div className="text-2xl font-black">{value}</div>
    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
      {label}
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
      active
        ? "bg-slate-900 text-white shadow-lg"
        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
    }`}
  >
    {label}
  </button>
);

function getTimeLeft() {
  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 36);

  const difference = targetDate - new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default HomePage;