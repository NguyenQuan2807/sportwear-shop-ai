import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sendAiChatMessage } from "../../services/aiChatService";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Xin chào! Mình là trợ lý AI của Sportwear Shop. Bạn có thể hỏi mình về sản phẩm, size, màu, giá hoặc nhờ mình gợi ý đồ thể thao phù hợp.",
  },
];

const toApiHistory = (messages) =>
  messages
    .filter((item) => item?.content)
    .slice(-10)
    .map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: item.content,
    }));

const AiChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = async (event) => {
    event?.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAiChatMessage({
        message: text,
        history: toApiHistory(messages),
      });

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
            "Mình đang gặp lỗi khi kết nối AI. Bạn thử lại sau hoặc kiểm tra backend giúp mình nhé.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex h-[560px] w-[360px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Sportwear AI</p>
              <p className="text-xs text-white/70">Tư vấn sản phẩm trực tuyến</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-sm hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "border border-black/10 bg-white text-black"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-black/60">
                Mình đang suy nghĩ...
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  Sản phẩm liên quan
                </p>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    to={product.productUrl || `/products/${product.id}`}
                    className="flex gap-3 rounded-xl border border-black/10 bg-white p-2 hover:border-black/30"
                    onClick={() => setOpen(false)}
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-100">
                      {product.thumbnailUrl ? (
                        <img
                          src={resolveImageUrl(product.thumbnailUrl)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-black">{product.name}</p>
                      <p className="text-xs text-black/60">{product.priceLabel}</p>
                      {product.reason ? (
                        <p className="line-clamp-1 text-xs text-black/40">{product.reason}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-black/10 bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hỏi về sản phẩm, size, màu..."
              className="min-w-0 flex-1 rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/30"
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-14 w-14 rounded-full bg-black text-xl text-white shadow-2xl transition hover:scale-105"
      >
        AI
      </button>
    </div>
  );
};

export default AiChatBox;
