import { useEffect, useMemo, useState } from "react";
import {
  getProductReviewsApi,
  getProductReviewSummaryApi,
} from "../../services/reviewService";

const formatDateTime = (value) => {
  if (!value) return "Đang cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const Stars = ({ value, size = "text-base" }) => {
  const rounded = Math.round(Number(value || 0));

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rounded ? "text-yellow-500" : "text-black/15"}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ProductReviewsSection = ({ productId }) => {
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [summaryResponse, reviewsResponse] = await Promise.all([
          getProductReviewSummaryApi(productId),
          getProductReviewsApi(productId),
        ]);

        setSummary(
          summaryResponse?.data || {
            averageRating: 0,
            totalReviews: 0,
          }
        );
        setReviews(reviewsResponse?.data || []);
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message || "Không thể tải đánh giá sản phẩm";
        setErrorMessage(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const averageText = useMemo(() => {
    const value = Number(summary?.averageRating || 0);
    return value > 0 ? value.toFixed(1) : "0.0";
  }, [summary?.averageRating]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-black/6" />
        <div className="h-20 animate-pulse rounded-2xl bg-black/6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-black/6" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-[28px] border border-black/8 bg-[#fafafa] p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-4xl font-semibold tracking-tight text-black">
              {averageText}
            </p>
            <p className="mt-1 text-sm text-black/55">
              {summary?.totalReviews || 0} đánh giá
            </p>
          </div>
          <div>
            <Stars value={summary?.averageRating || 0} size="text-2xl" />
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/12 px-5 py-6 text-[15px] text-black/55">
          Chưa có đánh giá nào cho sản phẩm này.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[28px] border border-black/8 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[17px] font-semibold text-black">
                    {review.userFullName || "Khách hàng"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Stars value={review.rating} />
                    <span className="text-sm text-black/45">
                      {formatDateTime(review.createdAt)}
                    </span>
                  </div>
                </div>

                {(review.size || review.color) ? (
                  <div className="rounded-full bg-black/4 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-black/55">
                    {[review.size, review.color].filter(Boolean).join(" • ")}
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-[15px] leading-7 text-black/72">
                {review.comment || "Khách hàng không để lại nhận xét."}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;
