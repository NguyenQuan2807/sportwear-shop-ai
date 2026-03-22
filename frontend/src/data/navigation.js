export const navigationItems = [
  {
    label: "Nam",
    featured: {
      title: "Performance For Men",
      description: "Bộ sưu tập thể thao nam với thiết kế mạnh mẽ, linh hoạt.",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      link: "/products?gender=MALE",
    },
    sections: [
      {
        title: "Danh mục",
        links: [
          { label: "Giày nam", href: "/products?gender=MALE&category=Giày" },
          {
            label: "Quần áo nam",
            href: "/products?gender=MALE&category=Quần áo",
          },
          {
            label: "Phụ kiện nam",
            href: "/products?gender=MALE&category=Phụ kiện",
          },
        ],
      },
      {
        title: "Môn thể thao",
        links: [
          { label: "Chạy bộ", href: "/products?sport=Running&gender=MALE" },
          { label: "Gym", href: "/products?sport=Gym&gender=MALE" },
          { label: "Bóng đá", href: "/products?sport=Football&gender=MALE" },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { label: "Hàng mới", href: "/products?sort=newest" },
          { label: "Bán chạy", href: "/products?sort=popular" },
          { label: "Flash Sale", href: "/products?promotion=flash-sale" },
        ],
      },
    ],
  },
  {
    label: "Nữ",
    featured: {
      title: "Move With Confidence",
      description: "Thời trang thể thao nữ hiện đại, năng động và thoải mái.",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      link: "/products?gender=FEMALE",
    },
    sections: [
      {
        title: "Danh mục",
        links: [
          { label: "Giày nữ", href: "/products?gender=FEMALE&category=Giày" },
          {
            label: "Quần áo nữ",
            href: "/products?gender=FEMALE&category=Quần áo",
          },
          {
            label: "Phụ kiện nữ",
            href: "/products?gender=FEMALE&category=Phụ kiện",
          },
        ],
      },
      {
        title: "Môn thể thao",
        links: [
          { label: "Yoga", href: "/products?sport=Yoga&gender=FEMALE" },
          {
            label: "Training",
            href: "/products?sport=Training&gender=FEMALE",
          },
          { label: "Tennis", href: "/products?sport=Tennis&gender=FEMALE" },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { label: "Hàng mới", href: "/products?sort=newest" },
          { label: "Best Seller", href: "/products?sort=popular" },
          { label: "Ưu đãi hot", href: "/products?promotion=hot-deal" },
        ],
      },
    ],
  },
  {
    label: "Giày",
    featured: {
      title: "Run Faster, Feel Better",
      description: "Tuyển chọn giày chạy bộ, training và lifestyle nổi bật.",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      link: "/products?category=Giày",
    },
    sections: [
      {
        title: "Theo nhu cầu",
        links: [
          { label: "Giày chạy bộ", href: "/products?category=Giày&sport=Running" },
          { label: "Giày gym", href: "/products?category=Giày&sport=Gym" },
          { label: "Giày bóng đá", href: "/products?category=Giày&sport=Football" },
        ],
      },
      {
        title: "Theo giới tính",
        links: [
          { label: "Nam", href: "/products?category=Giày&gender=MALE" },
          { label: "Nữ", href: "/products?category=Giày&gender=FEMALE" },
          { label: "Unisex", href: "/products?category=Giày&gender=UNISEX" },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { label: "Giày mới về", href: "/products?category=Giày&sort=newest" },
          { label: "Giày nổi bật", href: "/products?category=Giày&sort=featured" },
          { label: "Giày giảm giá", href: "/products?category=Giày&promotion=sale" },
        ],
      },
    ],
  },
  {
    label: "Quần áo",
    featured: {
      title: "Built For Performance",
      description: "Áo, quần, set đồ tập với form đẹp và chất liệu thoáng khí.",
      image:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      link: "/products?category=Quần áo",
    },
    sections: [
      {
        title: "Danh mục",
        links: [
          { label: "Áo thể thao", href: "/products?category=Quần áo&type=shirt" },
          { label: "Quần thể thao", href: "/products?category=Quần áo&type=pants" },
          { label: "Áo khoác", href: "/products?category=Quần áo&type=jacket" },
        ],
      },
      {
        title: "Môn thể thao",
        links: [
          { label: "Gym", href: "/products?category=Quần áo&sport=Gym" },
          { label: "Running", href: "/products?category=Quần áo&sport=Running" },
          { label: "Tennis", href: "/products?category=Quần áo&sport=Tennis" },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { label: "Hàng mới", href: "/products?category=Quần áo&sort=newest" },
          { label: "Ưu đãi", href: "/products?category=Quần áo&promotion=sale" },
          { label: "Sản phẩm nổi bật", href: "/products?category=Quần áo&sort=featured" },
        ],
      },
    ],
  },
  {
    label: "Phụ kiện",
    featured: {
      title: "Finish Your Look",
      description: "Balo, nón, tất, bình nước và nhiều phụ kiện thể thao khác.",
      image:
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
      link: "/products?category=Phụ kiện",
    },
    sections: [
      {
        title: "Danh mục",
        links: [
          { label: "Balo", href: "/products?category=Phụ kiện&type=bag" },
          { label: "Nón", href: "/products?category=Phụ kiện&type=cap" },
          { label: "Tất", href: "/products?category=Phụ kiện&type=socks" },
        ],
      },
      {
        title: "Môn thể thao",
        links: [
          { label: "Running", href: "/products?category=Phụ kiện&sport=Running" },
          { label: "Gym", href: "/products?category=Phụ kiện&sport=Gym" },
          { label: "Football", href: "/products?category=Phụ kiện&sport=Football" },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { label: "Hàng mới", href: "/products?category=Phụ kiện&sort=newest" },
          { label: "Giảm giá", href: "/products?category=Phụ kiện&promotion=sale" },
          { label: "Mua nhiều", href: "/products?category=Phụ kiện&sort=popular" },
        ],
      },
    ],
  },
];