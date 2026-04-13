const productUrl = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const queryString = search.toString();
  return queryString ? `/products?${queryString}` : "/products";
};

const quickSearches = [
  "Giày chạy bộ",
  "Áo thể thao nam",
  "Áo thể thao nữ",
  "Quần short",
  "Phụ kiện tập luyện",
];

const navItems = [
  {
    label: "Nam",
    href: productUrl({ gender: "MALE" }),
    type: "mega",
    columns: [
      {
        title: "Danh mục nổi bật",
        links: [
          { label: "Áo nam", href: productUrl({ gender: "MALE", category: "Áo" }) },
          { label: "Quần nam", href: productUrl({ gender: "MALE", category: "Quần" }) },
          { label: "Giày nam", href: productUrl({ gender: "MALE", category: "Giày" }) },
          { label: "Đồ tập gym nam", href: productUrl({ gender: "MALE", sport: "Gym" }) },
        ],
      },
      {
        title: "Mua theo môn",
        links: [
          { label: "Chạy bộ", href: productUrl({ gender: "MALE", sport: "Chạy bộ" }) },
          { label: "Bóng đá", href: productUrl({ gender: "MALE", sport: "Bóng đá" }) },
          { label: "Gym", href: productUrl({ gender: "MALE", sport: "Gym" }) },
          { label: "Tennis", href: productUrl({ gender: "MALE", sport: "Tennis" }) },
        ],
      },
      {
        title: "Gợi ý nhanh",
        links: [
          { label: "Hàng mới về", href: productUrl({ gender: "MALE", sort: "newest" }) },
          { label: "Bán chạy", href: productUrl({ gender: "MALE", sort: "popular" }) },
          { label: "Đang giảm giá", href: productUrl({ gender: "MALE", sale: "true" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Men collection",
      title: "Phong cách thể thao hiện đại",
      description:
        "Khám phá bộ sưu tập nam với thiết kế mạnh mẽ, thoải mái và phù hợp cho cả tập luyện lẫn thường ngày.",
      ctaLabel: "Mua ngay",
      ctaHref: productUrl({ gender: "MALE" }),
    },
  },
  {
    label: "Nữ",
    href: productUrl({ gender: "FEMALE" }),
    type: "mega",
    columns: [
      {
        title: "Danh mục nổi bật",
        links: [
          { label: "Áo nữ", href: productUrl({ gender: "FEMALE", category: "Áo" }) },
          { label: "Quần nữ", href: productUrl({ gender: "FEMALE", category: "Quần" }) },
          { label: "Giày nữ", href: productUrl({ gender: "FEMALE", category: "Giày" }) },
          { label: "Đồ yoga nữ", href: productUrl({ gender: "FEMALE", sport: "Yoga" }) },
        ],
      },
      {
        title: "Mua theo môn",
        links: [
          { label: "Yoga", href: productUrl({ gender: "FEMALE", sport: "Yoga" }) },
          { label: "Chạy bộ", href: productUrl({ gender: "FEMALE", sport: "Chạy bộ" }) },
          { label: "Gym", href: productUrl({ gender: "FEMALE", sport: "Gym" }) },
          { label: "Tennis", href: productUrl({ gender: "FEMALE", sport: "Tennis" }) },
        ],
      },
      {
        title: "Gợi ý nhanh",
        links: [
          { label: "Hàng mới về", href: productUrl({ gender: "FEMALE", sort: "newest" }) },
          { label: "Bán chạy", href: productUrl({ gender: "FEMALE", sort: "popular" }) },
          { label: "Đang giảm giá", href: productUrl({ gender: "FEMALE", sale: "true" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Women collection",
      title: "Năng động, tinh tế, thoải mái",
      description:
        "Những thiết kế nữ tính nhưng vẫn tối ưu cho vận động, tập luyện và phong cách sống active mỗi ngày.",
      ctaLabel: "Khám phá",
      ctaHref: productUrl({ gender: "FEMALE" }),
    },
  },
  {
    label: "Giày",
    href: productUrl({ category: "Giày" }),
    type: "mega",
    columns: [
      {
        title: "Theo nhu cầu",
        links: [
          { label: "Giày chạy bộ", href: productUrl({ category: "Giày", sport: "Chạy bộ" }) },
          { label: "Giày bóng đá", href: productUrl({ category: "Giày", sport: "Bóng đá" }) },
          { label: "Giày gym", href: productUrl({ category: "Giày", sport: "Gym" }) },
        ],
      },
      {
        title: "Theo giới tính",
        links: [
          { label: "Giày nam", href: productUrl({ category: "Giày", gender: "MALE" }) },
          { label: "Giày nữ", href: productUrl({ category: "Giày", gender: "FEMALE" }) },
        ],
      },
      {
        title: "Khác",
        links: [
          { label: "Mẫu mới", href: productUrl({ category: "Giày", sort: "newest" }) },
          { label: "Giảm giá", href: productUrl({ category: "Giày", sale: "true" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Footwear",
      title: "Bứt tốc trong từng bước chạy",
      description:
        "Những mẫu giày thể thao tối ưu độ bám, độ êm và cảm giác linh hoạt trong mọi chuyển động.",
      ctaLabel: "Xem giày",
      ctaHref: productUrl({ category: "Giày" }),
    },
  },
  {
    label: "Quần Áo",
    href: productUrl({ category: "Quần áo" }),
    type: "mega",
    columns: [
      {
        title: "Danh mục",
        links: [
          { label: "Áo thể thao", href: productUrl({ category: "Áo" }) },
          { label: "Quần thể thao", href: productUrl({ category: "Quần" }) },
          { label: "Set đồ tập", href: productUrl({ category: "Quần áo", sport: "Gym" }) },
        ],
      },
      {
        title: "Theo mục đích",
        links: [
          { label: "Chạy bộ", href: productUrl({ category: "Quần áo", sport: "Chạy bộ" }) },
          { label: "Gym", href: productUrl({ category: "Quần áo", sport: "Gym" }) },
          { label: "Yoga", href: productUrl({ category: "Quần áo", sport: "Yoga" }) },
        ],
      },
      {
        title: "Khác",
        links: [
          { label: "Mới nhất", href: productUrl({ category: "Quần áo", sort: "newest" }) },
          { label: "Khuyến mãi", href: productUrl({ category: "Quần áo", sale: "true" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Apparel",
      title: "Mặc đẹp khi vận động",
      description:
        "Tập trung vào form dáng, độ thoáng và chất liệu để bạn mặc đẹp cả trong phòng tập lẫn ngoài phố.",
      ctaLabel: "Xem quần áo",
      ctaHref: productUrl({ category: "Quần áo" }),
    },
  },
  {
    label: "Phụ kiện",
    href: productUrl({ category: "Phụ kiện" }),
    type: "mega",
    columns: [
      {
        title: "Phổ biến",
        links: [
          { label: "Túi & balo", href: productUrl({ category: "Phụ kiện", keyword: "balo" }) },
          { label: "Mũ", href: productUrl({ category: "Phụ kiện", keyword: "mũ" }) },
          { label: "Vớ", href: productUrl({ category: "Phụ kiện", keyword: "vớ" }) },
        ],
      },
      {
        title: "Tập luyện",
        links: [
          { label: "Phụ kiện gym", href: productUrl({ category: "Phụ kiện", sport: "Gym" }) },
          { label: "Phụ kiện chạy bộ", href: productUrl({ category: "Phụ kiện", sport: "Chạy bộ" }) },
        ],
      },
      {
        title: "Khác",
        links: [
          { label: "Mới nhất", href: productUrl({ category: "Phụ kiện", sort: "newest" }) },
          { label: "Giảm giá", href: productUrl({ category: "Phụ kiện", sale: "true" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Accessories",
      title: "Hoàn thiện set đồ thể thao",
      description:
        "Phụ kiện giúp bạn tối ưu công năng, đồng thời tăng điểm nhấn cho phong cách năng động hằng ngày.",
      ctaLabel: "Xem phụ kiện",
      ctaHref: productUrl({ category: "Phụ kiện" }),
    },
  },
  {
    label: "Sale",
    href: productUrl({ sale: "true" }),
    type: "mega",
    columns: [
      {
        title: "Khuyến mãi",
        links: [
          { label: "Sale nam", href: productUrl({ sale: "true", gender: "MALE" }) },
          { label: "Sale nữ", href: productUrl({ sale: "true", gender: "FEMALE" }) },
        ],
      },
      {
        title: "Sale theo nhóm",
        links: [
          { label: "Giày sale", href: productUrl({ sale: "true", category: "Giày" }) },
          { label: "Quần áo sale", href: productUrl({ sale: "true", category: "Quần áo" }) },
          { label: "Phụ kiện sale", href: productUrl({ sale: "true", category: "Phụ kiện" }) },
        ],
      },
      {
        title: "Khác",
        links: [
          { label: "Mức giảm sâu", href: productUrl({ sale: "true", sort: "discountDesc" }) },
          { label: "Sản phẩm nổi bật", href: productUrl({ sale: "true", sort: "popular" }) },
        ],
      },
    ],
    feature: {
      eyebrow: "Sale up to",
      title: "Ưu đãi tốt cho nhiều dòng sản phẩm",
      description:
        "Tổng hợp các sản phẩm đang có giá tốt để bạn mua nhanh hơn mà vẫn đúng nhu cầu.",
      ctaLabel: "Xem sale",
      ctaHref: productUrl({ sale: "true" }),
    },
  },
];

const visibleNavItems = navItems;

export { productUrl, quickSearches, navItems, visibleNavItems };