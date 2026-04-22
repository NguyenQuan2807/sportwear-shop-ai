import { useEffect, useMemo, useState } from "react";
import { createReviewApi } from "../../services/reviewService";

const starValues = [1, 2, 3, 4, 5];

const renderStarLabel = (rating) => {
  switch (rating) {
    case 1:
      return "Rất tệ";
    case 2:
      return "Tệ";
    case 3:
      return "Ổn";
    case 4:
      return "Tốt";
    case 5:
      return "Rất tốt";
    default:
      return "Chọn số sao";
  }
};

const ReviewModal = ({ open, item, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating(5);
    setComment("");
    setErrorMessage("");
  }, [open, item?.id]);

  const title = useMemo(() => {
    if (!item) return "Đánh giá sản phẩm";
    return `${item.productName}${item.size ? ` - ${item.size}` : ""}${
      item.color ? ` - ${item.color}` : ""
    }`;
  }, [item]);

  if (!open || !item) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");

      await createReviewApi({
        orderItemId: item.id,
        rating,
        comment,
      });

      if (typeof onSuccess === "function") {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể gửi đánh giá";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/45">
              Đánh giá sản phẩm
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-black">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:border-black"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-black/65">Số sao</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {starValues.map((value) => {
                const active = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`text-3xl leading-none transition ${
                      active ? "text-yellow-500" : "text-black/20 hover:text-black/40"
                    }`}
                    aria-label={`Chọn ${value} sao`}
                  >
                    ★
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-medium text-black/55">
                {renderStarLabel(rating)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-black/65" htmlFor="review-comment">
              Nhận xét
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              className="mt-3 w-full rounded-2xl border border-black/12 px-4 py-3 text-[15px] text-black outline-none transition placeholder:text-black/30 focus:border-black"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
