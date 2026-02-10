"use client";

import { useMemo, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  price: number; // stored in VND
  unit: string;
};

function formatVnd(price: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  } catch {
    return `${price} ₫`;
  }
}

export function ProductsTable({
  products,
  updateProductAction,
  deleteProductAction,
}: {
  products: ProductRow[];
  updateProductAction: (formData: FormData) => void | Promise<void>;
  deleteProductAction: (formData: FormData) => void | Promise<void>;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) => p.name.toLowerCase().includes(needle));
  }, [products, q]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium">
            Sản phẩm ({filtered.length}
            {q.trim() ? ` / ${products.length}` : ""})
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-64 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            />
            {q.trim() ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Xóa
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400">
              <tr className="text-left">
                <th className="px-6 py-3 font-medium">Tên</th>
                <th className="px-6 py-3 font-medium">Giá (nghìn)</th>
                <th className="px-6 py-3 font-medium">Đơn vị</th>
                <th className="px-6 py-3 font-medium">Hiển thị</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((p) => {
                const formId = `update-${p.id}`;
                return (
                  <tr key={p.id} className="align-middle">
                    <td className="px-6 py-3">
                      <input
                        form={formId}
                        name="name"
                        defaultValue={p.name}
                        className="w-full min-w-64 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                        required
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        form={formId}
                        name="price"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={p.price / 1000}
                        className="w-40 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                        required
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        form={formId}
                        name="unit"
                        defaultValue={p.unit}
                        placeholder="vd: hộp"
                        className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                      />
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatVnd(p.price)}
                      {p.unit ? ` / ${p.unit}` : ""}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          form={formId}
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          Lưu
                        </button>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                          >
                            Xóa
                          </button>
                        </form>
                      </div>

                      <form
                        id={formId}
                        action={updateProductAction}
                        className="hidden"
                      >
                        <input type="hidden" name="id" value={p.id} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

