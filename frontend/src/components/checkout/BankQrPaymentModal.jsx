import { useEffect, useMemo, useState } from "react";
import { getQrCheckoutSessionStatusApi } from "../../services/bankQrPaymentService";

const POLL_INTERVAL_MS = 2500;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getRemainingSeconds = (expiresAt) => {
  if (!expiresAt) return 0;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
};

const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const BankQrPaymentModal = ({ open, session, onSuccess, onFailed }) => {
  const [latestSession, setLatestSession] = useState(session);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    setLatestSession(session);
    setRemainingSeconds(getRemainingSeconds(session?.expiresAt));
  }, [session]);

  useEffect(() => {
    if (!open || !session?.sessionId) return undefined;

    let timerId;
    let pollId;

    const fetchStatus = async () => {
      const response = await getQrCheckoutSessionStatusApi(session.sessionId);
      const nextSession = response.data;
      setLatestSession(nextSession);
      setRemainingSeconds(getRemainingSeconds(nextSession?.expiresAt));

      if (nextSession?.status === "PAID" && nextSession?.orderId) {
        onSuccess(nextSession.orderId);
      }

      if (nextSession?.status === "EXPIRED" || nextSession?.status === "FAILED") {
        onFailed(nextSession?.message || "Thanh toán thất bại.");
      }
    };

    timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    pollId = window.setInterval(async () => {
      try {
        await fetchStatus();
      } catch (error) {
        console.error(error);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
      window.clearInterval(pollId);
    };
  }, [open, session?.sessionId, onSuccess, onFailed]);

  const statusLabel = useMemo(() => {
    const status = latestSession?.status || "PENDING";
    switch (status) {
      case "PAID":
        return "Thanh toán thành công";
      case "EXPIRED":
        return "Đã hết hạn";
      case "FAILED":
        return "Thanh toán thất bại";
      default:
        return `Còn lại ${formatCountdown(remainingSeconds)}`;
    }
  }, [latestSession?.status, remainingSeconds]);

  if (!open || !latestSession) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
              Thanh toán QR ngân hàng
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-black">
              Quét mã để thanh toán
            </h3>
            <p className="mt-3 text-sm leading-7 text-black/55">
              Đơn hàng chỉ được tạo sau khi hệ thống xác nhận chuyển khoản thành công.
            </p>
          </div>
          <div className="rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-sm font-semibold text-black">
            {statusLabel}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-5">
          <img
            src={latestSession.qrImageUrl}
            alt="QR thanh toán"
            className="mx-auto aspect-square w-full max-w-[320px] rounded-2xl border border-black/10 bg-white object-contain p-4"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Ngân hàng" value={latestSession.bankName} />
            <Info label="Số tài khoản" value={latestSession.accountNumber} />
            <Info label="Chủ tài khoản" value={latestSession.accountHolder} />
            <Info label="Số tiền" value={formatCurrency(latestSession.amount)} />
            <Info label="Nội dung" value={latestSession.paymentCode} />
            <Info label="Trạng thái" value={latestSession.status} />
          </div>
        </div>

        {latestSession.message ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
            {latestSession.message}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nếu hết thời gian mà chưa thanh toán, modal sẽ tự đóng và đơn hàng sẽ không được tạo.
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">{label}</div>
    <div className="mt-2 break-all text-sm font-semibold text-black">{value || "--"}</div>
  </div>
);

export default BankQrPaymentModal;
