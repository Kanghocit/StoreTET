"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { lookupProductAction } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function QuantityStepper({
  value,
  min = 1,
  onChange,
  className,
}: {
  value: number;
  min?: number;
  onChange: (qty: number) => void;
  className?: string;
}) {
  const clamped = Math.max(min, Math.floor(Number(value) || min));
  return (
    <div
      className={`flex h-7 items-stretch overflow-hidden rounded border border-input bg-background ${className ?? ""}`}
    >
      <Input
        type="number"
        min={min}
        value={clamped}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!Number.isNaN(v)) onChange(Math.max(min, v));
        }}
        className="h-full w-9 shrink border-0 rounded-none py-0 text-center text-xs focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="w-px shrink-0 bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-full w-7 shrink cursor-pointer rounded-none border-0 border-r border-border p-0"
        onClick={() => onChange(Math.max(min, clamped - 1))}
        disabled={clamped <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="w-px shrink-0 bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-full w-7 shrink cursor-pointer rounded-none border-0 p-0"
        onClick={() => onChange(clamped + 1)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

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
    {
      id: string;
      name: string;
      price: number;
      unit: string;
      categoryName?: string;
    }[]
  >([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [cart, setCart] = useState<
    {
      id: string;
      name: string;
      price: number;
      unit: string;
      qty: number;
      categoryName?: string;
    }[]
  >([]);
  const [addQty, setAddQty] = useState(1);
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
          items: {
            id: string;
            name: string;
            price: number;
            unit: string;
            categoryName?: string;
          }[];
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

  const handleSelect = (item: { id: string; name: string }) => {
    setQuery(item.name);
    setSuggestions([]);
    const fd = new FormData();
    fd.set("id", item.id);
    action(fd);
  };

  const handleAddToCartFromState = () => {
    if (!state?.ok) return;
    const id = state.id;
    const qty = Math.max(1, addQty);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          id,
          name: state.name,
          price: state.price,
          unit: state.unit,
          qty,
          categoryName: state.categoryName,
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

  return (
    <div className="grid w-full grid-cols-1 items-start gap-6 sm:p-6">
      <Card className="border-border bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Tra cứu sản phẩm & tạo đơn
          </h1>
          <p className="text-sm text-muted-foreground">
            Gõ tên sản phẩm để tra giá, thêm vào giỏ và xem tổng tiền ngay.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            ref={formRef}
            action={action}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              name="name"
              placeholder='Ví dụ: "iPhone"'
              className="flex-1"
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Đang tra cứu..." : "Tra cứu"}
            </Button>
          </form>

          {suggestions.length > 0 && (
            <div className="border-input max-h-56 w-full overflow-auto rounded-md border bg-background text-sm">
              {suggestions.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="ghost"
                  className="flex w-full items-center justify-between gap-3 font-normal"
                  onClick={() => handleSelect(s)}
                >
                  <span>
                    {s.name}
                    {s.categoryName ? (
                      <span className="ml-1.5 text-muted-foreground">
                        ({s.categoryName})
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatVnd(s.price)}
                    {s.unit ? ` / ${s.unit}` : ""}
                  </span>
                </Button>
              ))}
              {loadingSuggest && (
                <div className="border-t border-border px-3 py-1 text-xs text-muted-foreground">
                  Đang tải gợi ý...
                </div>
              )}
            </div>
          )}

          <div>
            {state?.ok ? (
              <div className="rounded-lg border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    {state.name}
                    {state.categoryName ? (
                      <span className="ml-1.5 font-normal text-green-700 dark:text-green-300">
                        ({state.categoryName})
                      </span>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800 dark:bg-green-900/60 dark:text-green-100">
                    Đã tra cứu
                  </span>
                </div>
                <div className="mt-1 text-xs text-green-900/80 dark:text-green-100">
                  Giá:{" "}
                  <span className="font-semibold">
                    {formatVnd(state.price)}
                    {state.unit ? ` / ${state.unit}` : ""}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-between">
                  <QuantityStepper
                    value={addQty}
                    min={1}
                    onChange={setAddQty}
                    className="shrink-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddToCartFromState}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            ) : state && !state.ok ? (
              <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                {state.error}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sản phẩm mẫu: Chổi, Bút
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {cart.length > 0 && (
        <Card className="min-w-0 bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h2 className="text-sm font-medium">Giỏ hàng</h2>
            <span className="text-xs text-muted-foreground">
              {cart.length} mặt hàng
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {item.name}
                      {item.categoryName ? (
                        <span className="ml-1 text-muted-foreground">
                          ({item.categoryName})
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Đơn giá: {formatVnd(item.price)}
                      {item.unit ? ` / ${item.unit}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <QuantityStepper
                      value={item.qty}
                      min={1}
                      onChange={(qty) => handleQtyChange(item.id, qty)}
                      className="shrink-0"
                    />
                    <span className="text-xs font-medium">
                      {formatVnd(item.price * item.qty)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Tổng tiền</span>
              <span>{formatVnd(total)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
