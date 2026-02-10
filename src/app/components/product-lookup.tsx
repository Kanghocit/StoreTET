"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { lookupProductAction } from "@/app/actions/products";

function formatVnd(price: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  } catch {
    return `${price} ₫`;
  }
}

export function ProductLookup() {
  const [state, action, pending] = useActionState(lookupProductAction, null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string; price: number; unit: string }[]
  >([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [cart, setCart] = useState<
    { id: string; name: string; price: number; unit: string; qty: number }[]
  >([]);
  const abortRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      abortRef.current?.abort();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await fetch(
          `/api/products/suggest?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          items: { id: string; name: string; price: number; unit: string }[];
        };
        setSuggestions(data.items ?? []);
      } catch {
        // ignore abort / network errors
      } finally {
        setLoadingSuggest(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    const fd = new FormData();
    fd.set("name", name);
    action(fd);
  };

  const handleAddToCartFromState = () => {
    if (!state?.ok) return;
    const id = state.name; // dùng tên làm id logic
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id,
          name: state.name,
          price: state.price,
          unit: state.unit,
          qty: 1,
        },
      ];
    });
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (!Number.isFinite(qty) || qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const containerClass =
    "grid w-full grid-cols-1 items-start gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-6";

  return (
    <div className={containerClass}>
      <section className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Tra cứu sản phẩm & tạo đơn
        </h1>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
          Gõ tên sản phẩm để tra giá, thêm vào giỏ và xem tổng tiền ngay.
        </p>

        <form
          ref={formRef}
          action={action}
          className="mt-6 flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            name="name"
            placeholder='Ví dụ: "iPhone"'
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {pending ? "Đang tra cứu..." : "Tra cứu"}
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.name)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <span>{s.name}</span>
                <span className="text-xs text-zinc-500">
                  {formatVnd(s.price)}
                  {s.unit ? ` / ${s.unit}` : ""}
                </span>
              </button>
            ))}
            {loadingSuggest && (
              <div className="border-t border-zinc-100 px-3 py-1 text-xs text-zinc-400 dark:border-zinc-800">
                Đang tải gợi ý...
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          {state?.ok ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{state.name}</div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
                  Đã tra cứu
                </span>
              </div>
              <div className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100">
                Giá:{" "}
                <span className="font-semibold">
                  {formatVnd(state.price)}
                  {state.unit ? ` / ${state.unit}` : ""}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddToCartFromState}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Thêm vào giỏ
                </button>
                <span className="text-[11px] text-emerald-900/70 dark:text-emerald-100/80">
                  Bấm nhiều lần để tăng số lượng
                </span>
              </div>
            </div>
          ) : state && !state.ok ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200">
              {state.error}
            </div>
          ) : (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Sản phẩm mẫu: Chổi, Bút
            </div>
          )}
        </div>
      </section>

      {cart.length > 0 && (
        <aside className="min-w-0 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Giỏ hàng
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {cart.length} mặt hàng
            </span>
          </div>
          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Đơn giá: {formatVnd(item.price)}
                    {item.unit ? ` / ${item.unit}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      handleQtyChange(item.id, Number(e.target.value))
                    }
                    className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                  />
                  <div className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                    {formatVnd(item.price * item.qty)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm font-semibold dark:border-zinc-800">
            <span>Tổng tiền</span>
            <span>{formatVnd(total)}</span>
          </div>
        </aside>
      )}
    </div>
  );
}
