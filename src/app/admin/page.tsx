import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/actions/products";
import { AdminTabs } from "./admin-tabs";

export default async function AdminPage() {
  await requireAdmin();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: true },
    }),
  ]);

  const productsWithCategory = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.category?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản trị</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Tab Loại sản phẩm: thêm, sửa, xóa loại. Tab Sản phẩm: thêm, sửa, xóa sản phẩm. Sửa/xóa không load lại trang.
        </p>
      </div>

      <AdminTabs
        categories={categories}
        products={productsWithCategory}
        createProductAction={createProductAction}
        updateProductAction={updateProductAction}
        deleteProductAction={deleteProductAction}
      />
    </div>
  );
}
