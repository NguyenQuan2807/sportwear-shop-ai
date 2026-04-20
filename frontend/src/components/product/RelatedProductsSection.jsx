import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../../services/productService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import { formatCurrency } from "../../utils/formatCurrency";

const genderLabelMap = {
  MALE: "nam",
  FEMALE: "nữ",
  UNISEX: "unisex",
};

const RelatedProductCard = ({ product }) => {
  const infoText = [product?.categoryName, genderLabelMap[product?.gender]]
    .filter(Boolean)
    .join(" ")
    .replace(/^./, (char) => char.toUpperCase());

  const hasPromotion = Boolean(product?.onPromotion);
  const saleLabel = product?.saleMinPrice === product?.saleMaxPrice
    ? formatCurrency(product?.saleMinPrice)
    : `${formatCurrency(product?.saleMinPrice)} - ${formatCurrency(product?.saleMaxPrice)}`;
  const originalLabel = product?.originalMinPrice === product?.originalMaxPrice
    ? formatCurrency(product?.originalMinPrice)
    : `${formatCurrency(product?.originalMinPrice)} - ${formatCurrency(product?.originalMaxPrice)}`;
  const regularLabel = product?.minPrice === product?.maxPrice
    ? formatCurrency(product?.minPrice)
    : `${formatCurrency(product?.minPrice)} - ${formatCurrency(product?.maxPrice)}`;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <article className="space-y-4">
        <div className="aspect-square overflow-hidden bg-[#efefef]">
          <img
            src={resolveImageUrl(product?.thumbnailUrl)}
            alt={product?.name}
            className="h-full w-full object-cover transition duration-500 "
          />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold leading-6 text-black">{product?.name}</h3>
          <p className="text-sm text-black/60">{infoText || "Sản phẩm thể thao"}</p>
          <p className="text-sm text-black/60">{product?.colorCount || 0} màu</p>

          {hasPromotion ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-black">{saleLabel}</span>
                <span className="text-black/35 line-through">{originalLabel}</span>
              </div>
              <p className="text-sm font-semibold text-green-600">
                Giảm giá {product?.maxDiscountPercent || 0}%
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-black">{regularLabel}</p>
          )}
        </div>
      </article>
    </Link>
  );
};

const RelatedProductsSection = ({ productId, categoryId, sportId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId || !categoryId || !sportId) {
      setItems([]);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const response = await getProductsApi({
          categoryId,
          sportId,
          size: 12,
          sort: "newest",
        });

        const content = Array.isArray(response?.data?.content) ? response.data.content : [];
        const filtered = content.filter((item) => Number(item.id) !== Number(productId));
        setItems(filtered.slice(0, 8));
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId, categoryId, sportId]);

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
      <div className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">
              Sản phẩm tương tự
            </h2>
          </div>

          <Link to="/products" className="text-sm font-semibold text-black underline underline-offset-4">
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="aspect-square animate-pulse rounded-2xl bg-black/6" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-black/6" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-black/6" />
              </div>
            ))}
          </div>
        ) : hasItems ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <RelatedProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-8 text-sm text-black/55">
            Chưa có sản phẩm tương tự phù hợp.
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
