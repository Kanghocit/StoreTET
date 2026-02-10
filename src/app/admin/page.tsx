import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
  importProductsAction,
} from "@/app/actions/products";
import { ProductsTable } from "./products-table";

export default async function AdminPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản trị</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Thêm, sửa hoặc xóa sản phẩm.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Thêm sản phẩm
        </h2>
        <form
          action={createProductAction}
          className="mt-3 flex flex-col gap-3 sm:flex-row"
        >
          <input
            name="name"
            placeholder="Tên sản phẩm"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            required
          />
          <input
            name="price"
            type="number"
            min={0}
            step={1}
            placeholder="Giá (nghìn VND, vd: 15)"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-48 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            required
          />
          <input
            name="unit"
            placeholder="Đơn vị (vd: hộp, cái)"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-48 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Thêm
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Import danh sách (tên,giá,đơn_vị)
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          Mỗi dòng một sản phẩm, định dạng:{" "}
          <span className="font-mono">ten_san_pham,gia,don_vi</span>
        </p>
        <form action={importProductsAction} className="mt-3 space-y-3">
          <textarea
            name="bulk"
            rows={5}
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-mono outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
            placeholder={`Cốt dừa to,28,hộp`}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Import danh sách
          </button>
        </form>
      </section>

      <ProductsTable
        products={products}
        updateProductAction={updateProductAction}
        deleteProductAction={deleteProductAction}
      />
    </div>
  );
}
