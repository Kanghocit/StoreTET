"use client";

import { useMemo, useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/products";
import { RefreshAfterSubmit } from "./refresh-after-submit";

type Category = { id: string; name: string };

export function CategoriesTable({
  categories,
}: {
  categories: Category[];
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(needle));
  }, [categories, q]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form action={createCategoryAction} className="flex flex-wrap items-center gap-2">
            <RefreshAfterSubmit />
            <input
              name="name"
              placeholder="Tên loại (vd: Mì tôm)"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Thêm loại
            </button>
          </form>
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-56 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
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
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
          {categories.length === 0 ? "Chưa có loại nào. Thêm loại ở trên." : "Không tìm thấy."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400">
              <tr className="text-left">
                <th className="px-6 py-3 font-medium">Tên</th>
                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((c) => {
                const formId = `cat-${c.id}`;
                return (
                  <tr key={c.id} className="align-middle">
                    <td className="px-6 py-3">
                      <form id={formId} action={updateCategoryAction} className="flex gap-2">
                        <RefreshAfterSubmit />
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          name="name"
                          defaultValue={c.name}
                          className="w-full min-w-48 rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                          required
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          Lưu
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <form action={deleteCategoryAction} className="inline">
                        <RefreshAfterSubmit />
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                        >
                          Xóa
                        </button>
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
