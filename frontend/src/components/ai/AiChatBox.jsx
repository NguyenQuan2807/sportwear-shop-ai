import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sendAiChatMessage } from "../../services/aiChatService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const AI_CONVERSATION_ID_KEY = "sportwearAiConversationId";
const AI_SESSION_ID_KEY = "sportwearAiSessionId";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Xin chào! Mình là Sportwear AI. Bạn đang tìm giày, áo, quần hay phụ kiện thể thao? Mình có thể gợi ý theo môn tập, ngân sách, size, màu và thương hiệu bạn thích.",
  },
];

const quickPrompts = [
  "Gợi ý giày chạy bộ nam dưới 1 triệu",
  "Áo tập gym nữ thoáng mát",
  "Sản phẩm nào đang giảm giá?",
  "Tư vấn size giày cho mình",
];

const toApiHistory = (messages) =>
  messages
    .filter((item) => item?.content)
    .slice(-10)
    .map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: item.content,
    }));

const createSessionId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `sportwear-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const readConversationId = () => {
  const saved = localStorage.getItem(AI_CONVERSATION_ID_KEY);

  if (!saved) {
    return null;
  }

  const value = Number(saved);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const readSessionId = () => {
  let saved = localStorage.getItem(AI_SESSION_ID_KEY);

  if (!saved) {
    saved = createSessionId();
    localStorage.setItem(AI_SESSION_ID_KEY, saved);
  }

  return saved;
};

const RobotIcon = ({ className = "h-10 w-10" }) => (
  <svg
    viewBox="0 0 128 128"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="64" cy="64" r="62" fill="#DC2626" />
    <path d="M64 118L90 97H38L64 118Z" fill="#DC2626" />
    <rect x="27" y="36" width="74" height="52" rx="24" fill="#FFFFFF" />
    <rect x="42" y="49" width="44" height="18" rx="9" fill="#111111" />
    <path
      d="M50 56.5C50 52.9 53 50 56.8 50C60.7 50 65 52.8 67 56.5C65 60.2 60.7 63 56.8 63C53 63 50 60.1 50 56.5Z"
      fill="#FFFFFF"
    />
    <path
      d="M61 56.5C61 52.9 64 50 67.8 50C71.7 50 76 52.8 78 56.5C76 60.2 71.7 63 67.8 63C64 63 61 60.1 61 56.5Z"
      fill="#FFFFFF"
    />
    <path d="M59 75C60.5 77 62.2 78 64 78C65.8 78 67.5 77 69 75" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
    <path d="M39 28V41" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M89 28V41" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="39" cy="24" r="5.5" fill="#FFFFFF" />
    <circle cx="89" cy="24" r="5.5" fill="#FFFFFF" />
    <path
      d="M48 36C48 31.6 51.6 28 56 28H72C76.4 28 80 31.6 80 36"
      fill="#FFFFFF"
    />
  </svg>
);

const FloatingChatButton = ({ open, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative flex h-[74px] w-[74px] items-center justify-center rounded-full transition duration-300 hover:-translate-y-1 hover:scale-105"
    aria-label={open ? "Đóng Sportwear AI" : "Mở Sportwear AI"}
    title={open ? "Đóng Sportwear AI" : "Mở Sportwear AI"}
  >
    <div className="absolute inset-0 rounded-full bg-red-600 blur-xl opacity-30 transition group-hover:opacity-45" />
    <div className="relative">
      <RobotIcon className="h-[74px] w-[74px] drop-shadow-[0_12px_22px_rgba(0,0,0,0.35)]" />
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-black text-white">
        {open ? "×" : ""}
      </span>
    </div>
  </button>
);

const AssistantAvatar = () => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-red-100">
    <RobotIcon className="h-10 w-10" />
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-2 rounded-3xl rounded-bl-md border border-red-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-red-500" />
        <span className="ml-1">AI đang trả lời...</span>
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <AssistantAvatar />}

      <div
        className={`max-w-[82%] whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? "rounded-br-md bg-black text-white"
            : "rounded-bl-md border border-red-100 bg-white text-slate-800"
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-xs font-black text-white shadow-sm">
          Bạn
        </div>
      )}
    </div>
  );
};

const ProductSuggestionCard = ({ product, onOpenProduct }) => (
  <Link
    to={product.productUrl || `/products/${product.id}`}
    className="group flex gap-3 rounded-2xl border border-red-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
    onClick={onOpenProduct}
  >
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
      {product.thumbnailUrl ? (
        <img
          src={resolveImageUrl(product.thumbnailUrl)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg">🤖</div>
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-sm font-bold text-slate-900">{product.name}</p>

      {product.priceLabel ? (
        <p className="mt-1 text-sm font-semibold text-red-600">{product.priceLabel}</p>
      ) : null}

      {product.reason ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{product.reason}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {product.sizes ? (
          <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
            Size: {product.sizes}
          </span>
        ) : null}
        {product.colors ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
            Màu: {product.colors}
          </span>
        ) : null}
      </div>
    </div>
  </Link>
);

const AiChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] = useState(readConversationId);
  const [sessionId, setSessionId] = useState(readSessionId);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, suggestions, loading, open]);

  const saveConversationId = (value) => {
    if (!value) {
      return;
    }

    const nextConversationId = Number(value);

    if (!Number.isFinite(nextConversationId) || nextConversationId <= 0) {
      return;
    }

    setConversationId(nextConversationId);
    localStorage.setItem(AI_CONVERSATION_ID_KEY, String(nextConversationId));
  };

  const resetConversation = () => {
    const nextSessionId = createSessionId();

    localStorage.removeItem(AI_CONVERSATION_ID_KEY);
    localStorage.setItem(AI_SESSION_ID_KEY, nextSessionId);

    setConversationId(null);
    setSessionId(nextSessionId);
    setMessages(initialMessages);
    setSuggestions([]);
    setInput("");

    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const sendMessage = async (text) => {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;

    const userMessage = { role: "user", content: trimmedText };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAiChatMessage({
        conversationId,
        sessionId,
        message: trimmedText,
        history: toApiHistory(messages),
      });

      saveConversationId(data?.conversationId);

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data?.reply || "Mình chưa có câu trả lời phù hợp cho câu hỏi này.",
        },
      ]);

      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Mình đang gặp lỗi khi kết nối AI. Bạn thử kiểm tra backend hoặc cấu hình API AI rồi gửi lại giúp mình nhé.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    await sendMessage(input);
  };

  const handleQuickPrompt = async (prompt) => {
    if (loading) return;
    setOpen(true);
    await sendMessage(prompt);
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSend(event);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-4 flex h-[min(680px,calc(100vh-112px))] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:w-[430px]">
          <div className="relative overflow-hidden bg-gradient-to-r from-black via-slate-900 to-red-700 px-5 py-4 text-white">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-400/15 blur-3xl" />
            <div className="absolute -bottom-16 left-6 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                  <RobotIcon className="h-12 w-12" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black tracking-wide">Sportwear AI</p>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-white/90 ring-1 ring-white/15">
                      ONLINE
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-white/75">
                    Tư vấn sản phẩm, size, màu, giá và khuyến mãi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="rounded-full px-3 py-2 text-xs font-bold text-white/85 transition hover:bg-white/10 hover:text-white"
                  title="Tạo cuộc trò chuyện mới"
                >
                  Mới
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label="Đóng chat"
                  title="Đóng chat"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-red-50/40 via-white to-white p-4">
            {messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} message={message} />
            ))}

            {messages.length === 1 && !loading && (
              <div className="rounded-3xl border border-dashed border-red-200 bg-white p-3">
                <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-red-500">
                  Gợi ý câu hỏi
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-full border border-red-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && <TypingIndicator />}

            {suggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-black uppercase tracking-wide text-red-500">
                    Sản phẩm AI đề xuất
                  </p>
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                    {suggestions.length} sản phẩm
                  </span>
                </div>

                <div className="space-y-2">
                  {suggestions.map((product) => (
                    <ProductSuggestionCard
                      key={product.id}
                      product={product}
                      onOpenProduct={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-red-100 bg-white p-3">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="min-w-0 flex-1 rounded-3xl border border-red-200 bg-red-50/40 px-4 py-2 transition focus-within:border-red-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Hỏi AI về sản phẩm, size, màu, ngân sách..."
                  rows={1}
                  className="max-h-24 min-h-[32px] w-full resize-none bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
                />
                <p className="hidden text-[11px] text-slate-400 sm:block">
                  Nhấn Enter để gửi, Shift + Enter để xuống dòng
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSend}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
                aria-label="Gửi tin nhắn"
                title="Gửi"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}

      <FloatingChatButton open={open} onClick={() => setOpen((value) => !value)} />
    </div>
  );
};

export default AiChatBox;
