"use client";

import { useState } from "react";
import { CategoriesTable } from "./categories-table";
import { ProductsTable } from "./products-table";

type Category = { id: string; name: string };

type ProductRow = {
  id: string;
  name: string;
  price: number;
  unit: string;
  categoryId?: string;
  categoryName?: string | null;
};

export function AdminTabs({
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
  const [tab, setTab] = useState<"categories" | "products">("categories");

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "categories"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Loại sản phẩm
          </button>
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "products"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Sản phẩm
          </button>
        </nav>
      </div>

      {tab === "categories" && (
        <CategoriesTable
          categories={categories}
        />
      )}

      {tab === "products" && (
        <ProductsTable
          categories={categories}
          products={products}
          createProductAction={createProductAction}
          updateProductAction={updateProductAction}
          deleteProductAction={deleteProductAction}
        />
      )}
    </div>
  );
}
