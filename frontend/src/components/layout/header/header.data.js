const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const productUrl = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      if (value.length > 0) {
        search.set(key, value.join(","));
      }
      return;
    }

    search.set(key, value);
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

const isActiveItem = (item) => item?.isActive !== false;

const getItemName = (item) => normalizeText(`${item?.name || ""} ${item?.slug || ""}`);

const findCategory = (categories, keywords = []) =>
  categories.find((item) => {
    if (!isActiveItem(item)) return false;

    const name = getItemName(item);
    return keywords.some((keyword) => name.includes(normalizeText(keyword)));
  });

const findCategoryByExactOrKeyword = (categories, exactName, keywords = []) => {
  const normalizedExact = normalizeText(exactName);

  return (
    categories.find((item) => isActiveItem(item) && normalizeText(item.name) === normalizedExact) ||
    findCategory(categories, keywords)
  );
};

const categoryHref = (categories, fallbackName, keywords, extraParams = {}) => {
  const category = findCategoryByExactOrKeyword(categories, fallbackName, keywords);

  if (category?.id) {
    return productUrl({ ...extraParams, categoryId: category.id });
  }

  return productUrl({ ...extraParams, category: fallbackName });
};

const hasCategoryTerm = (category, terms = []) => {
  const name = normalizeText(category?.name || "");
  const slug = normalizeText(category?.slug || "");
  const fullText = getItemName(category);

  return terms.some((term) => {
    const value = normalizeText(term);

    return (
      name === value ||
      slug === value ||
      name.startsWith(`${value} `) ||
      slug.startsWith(`${value}-`) ||
      slug.startsWith(`${value}_`) ||
      fullText.includes(value)
    );
  });
};

const categoryGroupRules = {
  shoes: (category) => hasCategoryTerm(category, ["giay", "shoe"]),
  apparel: (category) => hasCategoryTerm(category, ["ao", "quan", "apparel", "clothing"]),
  accessories: (category) =>
    hasCategoryTerm(category, [
      "phu kien",
      "accessor",
      "tui",
      "balo",
      "ba lo",
      "mu",
      "non",
      "tat",
      "vo",
    ]),
};

const getCategoryGroupIds = (categories, group) =>
  categories
    .filter((item) => isActiveItem(item) && categoryGroupRules[group]?.(item))
    .map((item) => item.id)
    .filter(Boolean);

const groupHref = (_categories, group, extraParams = {}) =>
  productUrl({
    ...extraParams,
    categoryGroup: group,
  });

const sportHref = (sport, extraParams = {}) =>
  productUrl({
    ...extraParams,
    ...(sport?.id ? { sportId: sport.id } : { sport: sport?.name }),
  });

const buildSportLinks = (sports, buildLabel, extraParams = {}) =>
  sports
    .filter(isActiveItem)
    .map((sport) => ({
      label: buildLabel(sport),
      href: sportHref(sport, extraParams),
    }));

const featuredLinks = (extraParams = {}) => [
  { label: "Hàng mới về", href: productUrl({ ...extraParams, sort: "newest" }) },
  { label: "Bán chạy", href: productUrl({ ...extraParams, sort: "popular" }) },
  { label: "Đang sale", href: productUrl({ ...extraParams, promotionOnly: "true" }) },
];

const discountCategoryLinks = (categories) => {
  const activeCategories = categories.filter(isActiveItem);

  if (activeCategories.length === 0) {
    return [
      { label: "Giày sale", href: productUrl({ categoryGroup: "shoes", promotionOnly: "true" }) },
      { label: "Quần áo sale", href: productUrl({ categoryGroup: "apparel", promotionOnly: "true" }) },
      { label: "Phụ kiện sale", href: productUrl({ categoryGroup: "accessories", promotionOnly: "true" }) },
    ];
  }

  return activeCategories.map((category) => ({
    label: `${category.name} sale`,
    href: productUrl({ categoryId: category.id, promotionOnly: "true" }),
  }));
};

const isVisiblePromotion = (promotion) => {
  if (promotion?.isActive === false) return false;

  const status = String(promotion?.status || "").toUpperCase();
  return status === "ACTIVE" || status === "SCHEDULED";
};

const promotionProgramLinks = (promotions) => {
  const visiblePromotions = promotions.filter(isVisiblePromotion);

  if (visiblePromotions.length === 0) {
    return [{ label: "Tất cả sản phẩm sale", href: productUrl({ promotionOnly: "true" }) }];
  }

  return visiblePromotions.map((promotion) => ({
    label: promotion.name,
    href: productUrl({ promotionId: promotion.id }),
  }));
};

const fallbackSports = [
  { id: "", name: "Bóng đá" },
  { id: "", name: "Bóng chuyền" },
  { id: "", name: "Bóng rổ" },
  { id: "", name: "Chạy bộ" },
  { id: "", name: "Tennis" },
  { id: "", name: "Cầu lông" },
];

const buildMegaNavItems = ({ categories = [], sports = [], promotions = [] } = {}) => {
  const sportItems = sports.length > 0 ? sports : fallbackSports;

  return [
    {
      label: "Nam",
      href: productUrl({ gender: "MALE" }),
      type: "mega",
      columns: [
        {
          title: "Theo danh mục",
          links: [
            { label: "Áo nam", href: categoryHref(categories, "Áo", ["ao"], { gender: "MALE" }) },
            { label: "Quần nam", href: categoryHref(categories, "Quần", ["quan"], { gender: "MALE" }) },
            { label: "Giày nam", href: groupHref(categories, "shoes", { gender: "MALE" }) },
            { label: "Phụ kiện nam", href: groupHref(categories, "accessories", { gender: "MALE" }) },
          ],
        },
        {
          title: "Theo môn thể thao",
          links: buildSportLinks(sportItems, (sport) => sport.name, { gender: "MALE" }),
        },
        {
          title: "Nổi bật",
          links: featuredLinks({ gender: "MALE" }),
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
          title: "Theo danh mục",
          links: [
            { label: "Áo nữ", href: categoryHref(categories, "Áo", ["ao"], { gender: "FEMALE" }) },
            { label: "Quần nữ", href: categoryHref(categories, "Quần", ["quan"], { gender: "FEMALE" }) },
            { label: "Giày nữ", href: groupHref(categories, "shoes", { gender: "FEMALE" }) },
            { label: "Phụ kiện nữ", href: groupHref(categories, "accessories", { gender: "FEMALE" }) },
          ],
        },
        {
          title: "Theo môn thể thao",
          links: buildSportLinks(sportItems, (sport) => sport.name, { gender: "FEMALE" }),
        },
        {
          title: "Nổi bật",
          links: featuredLinks({ gender: "FEMALE" }),
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
      href: groupHref(categories, "shoes"),
      type: "mega",
      columns: [
        {
          title: "Theo giới tính",
          links: [
            { label: "Giày nam", href: groupHref(categories, "shoes", { gender: "MALE" }) },
            { label: "Giày nữ", href: groupHref(categories, "shoes", { gender: "FEMALE" }) },
            { label: "Giày unisex", href: groupHref(categories, "shoes", { gender: "UNISEX" }) },
          ],
        },
        {
          title: "Theo môn thể thao",
          links: [
            { label: "Giày bóng đá", href: sportHref({ name: "Bóng đá" }, { categoryGroup: "shoes" }) },
            { label: "Giày chạy bộ", href: sportHref({ name: "Chạy bộ" }, { categoryGroup: "shoes" }) },
            { label: "Giày bóng rổ", href: sportHref({ name: "Bóng rổ" }, { categoryGroup: "shoes" }) },
            { label: "Giày bóng chuyền", href: sportHref({ name: "Bóng chuyền" }, { categoryGroup: "shoes" }) },
            { label: "Giày tennis", href: sportHref({ name: "Tennis" }, { categoryGroup: "shoes" }) },
            { label: "Giày cầu lông", href: sportHref({ name: "Cầu lông" }, { categoryGroup: "shoes" }) },
          ].map((link) => {
            const matchedSport = sportItems.find(
              (sport) => normalizeText(sport.name) === normalizeText(link.label.replace(/^Giày\s+/i, ""))
            );

            return matchedSport?.id
              ? {
                  ...link,
                  href: sportHref(matchedSport, {
                    categoryGroup: "shoes",
                  }),
                }
              : {
                  ...link,
                  href: productUrl({
                    categoryGroup: "shoes",
                    sport: link.label.replace(/^Giày\s+/i, ""),
                  }),
                };
          }),
        },
        {
          title: "Nổi bật",
          links: featuredLinks({
            categoryGroup: "shoes",
          }),
        },
      ],
      feature: {
        eyebrow: "Footwear",
        title: "Bứt tốc trong từng bước chạy",
        description:
          "Những mẫu giày thể thao tối ưu độ bám, độ êm và cảm giác linh hoạt trong mọi chuyển động.",
        ctaLabel: "Xem giày",
        ctaHref: groupHref(categories, "shoes"),
      },
    },
    {
      label: "Quần Áo",
      href: groupHref(categories, "apparel"),
      type: "mega",
      columns: [
        {
          title: "Theo giới tính",
          links: [
            { label: "Quần áo nam", href: groupHref(categories, "apparel", { gender: "MALE" }) },
            { label: "Quần áo nữ", href: groupHref(categories, "apparel", { gender: "FEMALE" }) },
            { label: "Quần áo unisex", href: groupHref(categories, "apparel", { gender: "UNISEX" }) },
          ],
        },
        {
          title: "Môn thể thao",
          links: buildSportLinks(sportItems, (sport) => sport.name, {
            categoryGroup: "apparel",
          }),
        },
        {
          title: "Nổi bật",
          links: featuredLinks({
            categoryGroup: "apparel",
          }),
        },
      ],
      feature: {
        eyebrow: "Apparel",
        title: "Mặc đẹp khi vận động",
        description:
          "Tập trung vào form dáng, độ thoáng và chất liệu để bạn mặc đẹp cả trong phòng tập lẫn ngoài phố.",
        ctaLabel: "Xem quần áo",
        ctaHref: groupHref(categories, "apparel"),
      },
    },
    {
      label: "Phụ kiện",
      href: groupHref(categories, "accessories"),
      type: "mega",
      columns: [
        {
          title: "Phổ biến",
          links: [
            { label: "Túi", href: productUrl({ categoryGroup: "accessories", keyword: "túi" }) },
            { label: "Mũ", href: productUrl({ categoryGroup: "accessories", keyword: "mũ" }) },
            { label: "Balo", href: productUrl({ categoryGroup: "accessories", keyword: "balo" }) },
            { label: "Tất", href: productUrl({ categoryGroup: "accessories", keyword: "tất" }) },
          ],
        },
        {
          title: "Theo môn thể thao",
          links: buildSportLinks(sportItems, (sport) => sport.name, {
            categoryGroup: "accessories",
          }),
        },
        {
          title: "Nổi bật",
          links: featuredLinks({
            categoryGroup: "accessories",
          }),
        },
      ],
      feature: {
        eyebrow: "Accessories",
        title: "Hoàn thiện set đồ thể thao",
        description:
          "Phụ kiện giúp bạn tối ưu công năng, đồng thời tăng điểm nhấn cho phong cách năng động hằng ngày.",
        ctaLabel: "Xem phụ kiện",
        ctaHref: groupHref(categories, "accessories"),
      },
    },
    {
      label: "Sale",
      href: productUrl({ promotionOnly: "true" }),
      type: "mega",
      columns: [
        {
          title: "Danh mục giảm giá",
          links: discountCategoryLinks(categories),
        },
        {
          title: "Môn thể thao",
          links: buildSportLinks(sportItems, (sport) => `${sport.name} sale`, {
            promotionOnly: "true",
          }),
        },
        {
          title: "Chương trình",
          links: promotionProgramLinks(promotions),
        },
      ],
      feature: {
        eyebrow: "Sale up to",
        title: "Ưu đãi tốt cho nhiều dòng sản phẩm",
        description:
          "Tổng hợp các sản phẩm đang có giá tốt để bạn mua nhanh hơn mà vẫn đúng nhu cầu.",
        ctaLabel: "Xem sale",
        ctaHref: productUrl({ promotionOnly: "true" }),
      },
    },
  ];
};

const visibleNavItems = buildMegaNavItems();
const navItems = visibleNavItems;

export {
  productUrl,
  quickSearches,
  buildMegaNavItems,
  navItems,
  visibleNavItems,
  getCategoryGroupIds,
  normalizeText,
};
