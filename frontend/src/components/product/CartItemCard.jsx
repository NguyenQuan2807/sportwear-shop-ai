import { formatCurrency } from "../../utils/formatCurrency";

const CartItemCard = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  loadingItemId,
  deletingItemId,
}) => {
  const isUpdating = loadingItemId === item.id;
  const isDeleting = deletingItemId === item.id;

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {item.productName}
            </h3>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span>Size: {item.size}</span>
              <span>Màu: {item.color}</span>
            </div>

            <p className="text-base font-semibold text-blue-600">
              {formatCurrency(item.price)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDecrease(item)}
                disabled={isUpdating || item.quantity <= 1}
                className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>

              <span className="min-w-10 text-center font-medium">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item)}
                disabled={isUpdating}
                className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-4">
              <p className="font-bold text-slate-800">
                {formatCurrency(item.totalPrice)}
              </p>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;