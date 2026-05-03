import { useState } from "react";
import { getAdminPromotionSuggestionsApi } from "../../services/adminAiService";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminTableShell,
} from "./AdminShell";

const priorityClassName = (priority) => {
  if (priority === "HIGH") return "border-rose-200 bg-rose-50 text-rose-700";
  if (priority === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const sourceLabel = (source) =>
  source === "GEMINI_GROUNDED"
    ? "Gemini + dữ liệu thật"
    : "Rule-based scoring";

const discountBadgeClassName = (discount) => {
  if (!discount || discount <= 0) return "border-slate-200 bg-slate-50 text-slate-600";
  if (discount >= 20) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};

const AdminAiPromotionSuggestions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminPromotionSuggestionsApi();
      setData(response.data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tạo gợi ý khuyến mãi bằng AI",
      );
    } finally {
      setLoading(false);
    }
  };

  const openAiModal = () => {
    setModalOpen(true);
    setData(null);
    fetchSuggestions();
  };

  const suggestions = data?.suggestions || [];

  return (
    <>
      <AdminCard
        title="AI gợi ý khuyến mãi"
        description="Mở modal để AI phân tích tồn kho, doanh số, giá nhập và đề xuất % giảm giá an toàn."
        action={
          <AdminButton type="button" variant="brand" onClick={openAiModal}>
            Phân tích bằng AI
          </AdminButton>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-bold text-slate-900">Dữ liệu phân tích</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Tuổi đời sản phẩm, tồn kho, doanh số 30 ngày, doanh thu và khuyến mãi hiện tại.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-bold text-slate-900">Bảo vệ lợi nhuận</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Không đề xuất mức giảm thấp hơn giá nhập hoặc biên lợi nhuận tối thiểu.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-bold text-slate-900">Hiển thị gọn</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kết quả AI được hiển thị trong modal, không làm dài trang quản lý.
            </p>
          </div>
        </div>
      </AdminCard>

      <AiPromotionModal
        open={modalOpen}
        data={data}
        loading={loading}
        errorMessage={errorMessage}
        suggestions={suggestions}
        onRefresh={fetchSuggestions}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

function AiPromotionModal({
  open,
  data,
  loading,
  errorMessage,
  suggestions,
  onRefresh,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Đóng AI gợi ý khuyến mãi"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">AI Promotion Analysis</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Phân tích khuyến mãi bằng AI
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              AI chấm điểm sản phẩm bằng dữ liệu thật, kiểm tra tuổi đời sản phẩm và giá nhập để tránh giảm giá quá sớm hoặc bán lỗ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AdminButton type="button" variant="brand" onClick={onRefresh} disabled={loading}>
              {loading ? "AI đang phân tích..." : "Phân tích lại"}
            </AdminButton>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Đóng modal"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="space-y-4">
            {errorMessage ? <AdminAlert type="error">{errorMessage}</AdminAlert> : null}

            {loading && !data ? (
              <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
                <div className="h-[420px] animate-pulse rounded-3xl bg-slate-100" />
              </div>
            ) : !data ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
                Bấm <strong>Phân tích lại</strong> để hệ thống chấm điểm sản phẩm bằng dữ liệu thật.
                AI sẽ ưu tiên sản phẩm đủ thời gian bán, tồn kho cao, bán chậm, doanh thu thấp, chưa có khuyến mãi phù hợp,
                đồng thời loại trừ sản phẩm mới dưới 14 ngày và chặn mức giảm có nguy cơ thấp hơn giá nhập hoặc dưới biên lợi nhuận tối thiểu.
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-indigo-900">Tóm tắt AI</p>
                      <p className="mt-1 text-sm leading-6 text-indigo-800">
                        {data.summary}
                      </p>
                    </div>
                    <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-indigo-700">
                      {sourceLabel(data.source)}
                    </span>
                  </div>
                </div>

                {suggestions.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                    Hiện chưa có sản phẩm nào đủ điều kiện để AI đề xuất khuyến mãi.
                  </div>
                ) : (
                  <AdminTableShell>
                    <div className="overflow-x-auto">
                      <table className="min-w-[1480px] text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                          <tr>
                            <th className="px-5 py-4 font-semibold">Sản phẩm</th>
                            <th className="px-5 py-4 font-semibold">Nhóm</th>
                            <th className="px-5 py-4 font-semibold">Tồn kho</th>
                            <th className="px-5 py-4 font-semibold">Tuổi sản phẩm</th>
                            <th className="px-5 py-4 font-semibold">Bán 30 ngày</th>
                            <th className="px-5 py-4 font-semibold">Doanh thu 30 ngày</th>
                            <th className="px-5 py-4 font-semibold">Giảm AI</th>
                            <th className="px-5 py-4 font-semibold">Giảm an toàn</th>
                            <th className="px-5 py-4 font-semibold">Bảo vệ lợi nhuận</th>
                            <th className="px-5 py-4 font-semibold">Ưu tiên</th>
                            <th className="px-5 py-4 font-semibold">Lý do</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 bg-white">
                          {suggestions.map((item) => {
                            const safeDiscount = Number(item.suggestedDiscountPercent || 0);
                            const originalDiscount = Number(
                              item.originalSuggestedDiscountPercent ?? item.suggestedDiscountPercent ?? 0,
                            );
                            const isBlocked = safeDiscount <= 0;

                            return (
                              <tr key={item.productId} className="align-top hover:bg-slate-50/80">
                                <td className="px-5 py-4">
                                  <p className="font-bold text-slate-900">{item.productName}</p>
                                  <p className="mt-1 text-xs text-slate-500">#{item.productId}</p>
                                  {item.hasActivePromotion ? (
                                    <span className="mt-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                                      Đang có khuyến mãi
                                    </span>
                                  ) : null}
                                </td>
                                <td className="px-5 py-4 text-slate-600">
                                  <div>{item.category || "-"}</div>
                                  <div className="mt-1 text-xs text-slate-400">
                                    {item.brand || "-"} • {item.sport || "-"}
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-800">
                                  {item.totalStock}
                                </td>
                                <td className="px-5 py-4 text-slate-700">
                                  <div className="font-semibold text-slate-800">
                                    {item.productAgeDays ?? "-"} ngày
                                  </div>
                                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${lifecycleClassName(item.productLifecycleStatus)}`}>
                                    {lifecycleLabel(item.productLifecycleStatus)}
                                  </span>
                                  {item.ageRuleWarning ? (
                                    <p className="mt-2 max-w-[240px] text-xs leading-5 text-amber-600">
                                      {item.ageRuleWarning}
                                    </p>
                                  ) : null}
                                </td>
                                <td className="px-5 py-4 text-slate-700">
                                  {item.soldLast30Days}
                                </td>
                                <td className="px-5 py-4 text-slate-700">
                                  {formatCurrency(item.revenueLast30Days || 0)}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                                    {originalDiscount}%
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${discountBadgeClassName(safeDiscount)}`}>
                                    {isBlocked ? "Không giảm trực tiếp" : `${safeDiscount}%`}
                                  </span>
                                  {item.discountAdjusted ? (
                                    <p className="mt-2 text-xs font-semibold text-amber-600">
                                      Đã hạ từ {originalDiscount}%
                                    </p>
                                  ) : null}
                                </td>
                                <td className="px-5 py-4">
                                  {item.profitProtected ? (
                                    <div className="space-y-1 text-xs text-slate-600">
                                      <div>
                                        Tối đa an toàn: <strong>{item.maxAllowedDiscountPercent ?? 0}%</strong>
                                      </div>
                                      <div>
                                        LN thấp nhất sau giảm: <strong>{formatCurrency(item.minProfitPerUnitAfterDiscount || 0)}</strong>
                                      </div>
                                      <div>
                                        Biên LN thấp nhất: <strong>{Number(item.minProfitMarginPercentAfterDiscount || 0).toFixed(1)}%</strong>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                      Thiếu giá nhập
                                    </span>
                                  )}
                                  {item.profitWarning ? (
                                    <p className="mt-2 max-w-[260px] text-xs leading-5 text-rose-600">
                                      {item.profitWarning}
                                    </p>
                                  ) : null}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${priorityClassName(item.priority)}`}>
                                    {item.priority}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <p className="max-w-[340px] leading-6 text-slate-700">
                                    {item.reason}
                                  </p>
                                  <p className="mt-2 max-w-[340px] text-xs leading-5 text-slate-500">
                                    {item.expectedImpact}
                                  </p>
                                  <p className="mt-2 text-xs font-semibold text-slate-600">
                                    Campaign: {item.suggestedCampaignName}
                                  </p>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </AdminTableShell>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function lifecycleLabel(status) {
  if (status === "NEW_WATCHLIST") return "Mới - giảm nhẹ";
  if (status === "NEW_PROTECTED") return "Sản phẩm mới";
  if (status === "OLD_SLOW") return "Cũ - bán chậm";
  return "Đủ dữ liệu";
}

function lifecycleClassName(status) {
  if (status === "NEW_WATCHLIST") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "NEW_PROTECTED") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "OLD_SLOW") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function CloseIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export default AdminAiPromotionSuggestions;
