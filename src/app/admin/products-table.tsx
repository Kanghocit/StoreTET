"use client";

import { useMemo, useState } from "react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/actions/products";
import { RefreshAfterSubmit } from "./refresh-after-submit";
import { SearchableSelect } from "./searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function formatVnd(price: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  } catch {
    return `${price} ₫`;
  }
}

export function ProductsTable({
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
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.categoryName?.toLowerCase().includes(needle) ?? false) ||
        (p.unitName?.toLowerCase().includes(needle) ?? false),
    );
  }, [products, q]);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <form
          action={createProductAction}
          className="grid gap-3 sm:grid-cols-2"
        >
          <RefreshAfterSubmit />
          <SearchableSelect
            name="categoryId"
            options={categories}
            placeholder="-- Loại --"
            allowEmpty
            className="w-full"
          />
          <SearchableSelect
            name="unitId"
            options={units}
            placeholder="-- Đơn vị --"
            allowEmpty
            className="w-full"
          />
          <Input
            name="name"
            placeholder="Tên sản phẩm"
            className="w-full sm:col-span-2"
            required
          />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <Input
              name="price"
              type="number"
              min={0}
              step={1}
              placeholder="Giá (nghìn)"
              className="w-28 shrink-0"
              required
            />
            <Button type="submit" className="shrink-0">
              Thêm
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, loại hoặc đơn vị..."
            className="min-w-0 flex-1 max-w-md"
          />
          {q.trim() ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setQ("")}>
              Xóa
            </Button>
          ) : null}
          <span className="shrink-0 text-sm text-muted-foreground">
            {filtered.length}
            {q.trim() ? ` / ${products.length}` : ""} sản phẩm
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {products.length === 0
              ? "Chưa có sản phẩm. Thêm ở trên; thêm Loại và Đơn vị ở các tab tương ứng."
              : "Không tìm thấy."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giá (nghìn)</TableHead>
                <TableHead>Hiển thị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const formId = `update-${p.id}`;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <SearchableSelect
                        name="categoryId"
                        options={categories}
                        defaultValue={p.categoryId ?? ""}
                        placeholder="Chưa phân loại"
                        form={formId}
                      />
                    </TableCell>
                    <TableCell>
                      <SearchableSelect
                        name="unitId"
                        options={units}
                        defaultValue={p.unitId ?? ""}
                        placeholder="--"
                        form={formId}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        form={formId}
                        name="name"
                        defaultValue={p.name}
                        className="min-w-48"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        form={formId}
                        name="price"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={p.price / 1000}
                        className="w-24"
                        required
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatVnd(p.price)}
                      {p.unitName ? ` / ${p.unitName}` : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <form id={formId} action={updateProductAction} className="inline">
                          <RefreshAfterSubmit />
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Lưu
                          </Button>
                        </form>
                        <form action={deleteProductAction} className="inline">
                          <RefreshAfterSubmit />
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            Xóa
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
