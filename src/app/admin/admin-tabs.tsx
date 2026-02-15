"use client";

import { CategoriesTable } from "./categories-table";
import { UnitsTable } from "./units-table";
import { ProductsTable } from "./products-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Category = { id: string; name: string };
type Unit = { id: string; name: string };

type ProductRow = {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  categoryName?: string | null;
  unitId?: string;
  unitName?: string | null;
};

export function AdminTabs({
  categories,
  units,
  products,
  createProductAction,
  updateProductAction,
  deleteProductAction,
}: {
  categories: Category[];
  units: Unit[];
  products: ProductRow[];
  createProductAction: (formData: FormData) => void | Promise<void>;
  updateProductAction: (formData: FormData) => void | Promise<void>;
  deleteProductAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <Tabs defaultValue="categories" className="w-full space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="categories">Loại sản phẩm</TabsTrigger>
        <TabsTrigger value="units">Đơn vị</TabsTrigger>
        <TabsTrigger value="products">Sản phẩm</TabsTrigger>
      </TabsList>
      <TabsContent value="categories">
        <CategoriesTable categories={categories} />
      </TabsContent>
      <TabsContent value="units">
        <UnitsTable units={units} />
      </TabsContent>
      <TabsContent value="products">
        <ProductsTable
          categories={categories}
          units={units}
          products={products}
          createProductAction={createProductAction}
          updateProductAction={updateProductAction}
          deleteProductAction={deleteProductAction}
        />
      </TabsContent>
    </Tabs>
  );
}
