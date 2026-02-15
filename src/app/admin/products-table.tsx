"use client";

import { useMemo, useState } from "react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/actions/products";
import { RefreshAfterSubmit } from "./refresh-after-submit";

type Category = { id: string; name: string };

type ProductRow = {
  id: string;
  name: string;
  price: number;
  unit: string;
  categoryId?: string;
  categoryName?: string | null;
};

function formatVnd(price: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  } catch {
    return `${price} ₫`;
  }
}

export function ProductsTable({
  categories,
  products,
  createProductAction,
  updateProductAction,
  deleteProductAction,
}: {
  categories: Category[];
  products: ProductRow[];
  createProductAction: (formData: FormData) => void | Promise<void>;
  updateProductAction: (formData: FormData) => void | Promise<void>;
  deleteProductAction: (formData: FormData) => void | Promise<void>;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.categoryName?.toLowerCase().includes(needle) ?? false),
    );
  }, [products, q]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex flex-col gap-3">
          <form action={createProductAction} className="flex flex-wrap items-center gap-2">
            <RefreshAfterSubmit />
            <select
              name="categoryId"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            >
              <option value="">-- Loại --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Tên sản phẩm"
              className="min-w-40 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
              required
            />
            <input
              name="price"
              type="number"
              min={0}
              step={1}
              placeholder="Giá (nghìn)"
              className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
              required
            />
            <input
              name="unit"
              placeholder="Đơn vị"
              className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Thêm
            </button>
          </form>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên hoặc loại..."
              className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            />
            {q.trim() ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Xóa
              </button>
            ) : null}
            <span className="text-sm text-zinc-500">
              {filtered.length}{q.trim() ? ` / ${products.length}` : ""} sản phẩm
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
          {products.length === 0 ? "Chưa có sản phẩm. Thêm ở trên hoặc thêm loại ở tab Loại sản phẩm." : "Không tìm thấy."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400">
              <tr className="text-left">
                <th className="px-6 py-3 font-medium">Loại</th>
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
                      <select
                        form={formId}
                        name="categoryId"
                        defaultValue={p.categoryId ?? ""}
                        className="min-w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                      >
                        <option value="">Chưa phân loại</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input
                        form={formId}
                        name="name"
                        defaultValue={p.name}
                        className="min-w-48 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
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
                        className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                        required
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        form={formId}
                        name="unit"
                        defaultValue={p.unit}
                        placeholder="vd: hộp"
                        className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                      />
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatVnd(p.price)}
                      {p.unit ? ` / ${p.unit}` : ""}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <form id={formId} action={updateProductAction} className="inline">
                          <RefreshAfterSubmit />
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                          >
                            Lưu
                          </button>
                        </form>
                        <form action={deleteProductAction} className="inline">
                          <RefreshAfterSubmit />
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                          >
                            Xóa
                          </button>
                        </form>
                      </div>
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
