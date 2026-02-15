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

  const [categories, units, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.unit.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: true, unit: true },
    }),
  ]);

  const productsForTable = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.category?.name ?? null,
    unitId: p.unitId ?? undefined,
    unitName: p.unit?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản trị</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tab Loại sản phẩm, Đơn vị, Sản phẩm. Dropdown Loại/Đơn vị có ô tìm kiếm. Sửa/xóa không load lại trang.
        </p>
      </div>

      <AdminTabs
        categories={categories}
        units={units}
        products={productsForTable}
        createProductAction={createProductAction}
        updateProductAction={updateProductAction}
        deleteProductAction={deleteProductAction}
      />
    </div>
  );
}
