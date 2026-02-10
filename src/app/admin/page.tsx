import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
  importProductsAction,
} from "@/app/actions/products";

function formatVnd(price: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  } catch {
    return `${price} ₫`;
  }
}

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
        <form action={createProductAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
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
            placeholder={`Cốt dừa to,28,hộp
Cốt dừa nhỏ,15,hộp
Ống thoát nhôm,24,cái
Giấy,23,gói
Cage,58,cái`}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Import danh sách
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-6 py-4 text-sm font-medium dark:border-zinc-800">
          Sản phẩm ({products.length})
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
            Chưa có sản phẩm nào.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {products.map((p) => (
              <div key={p.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <form
                    action={updateProductAction}
                    className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      name="name"
                      defaultValue={p.name}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                      required
                    />
                    <input
                      name="price"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={p.price / 1000}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-48 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                      required
                    />
                    <input
                      name="unit"
                      defaultValue={p.unit}
                      placeholder="Đơn vị"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 sm:w-32 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Lưu
                    </button>
                  </form>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatVnd(p.price)}
                      {p.unit ? ` / ${p.unit}` : ""}
                    </div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

