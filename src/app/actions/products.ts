"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type LookupState =
  | { ok: true; id: string; name: string; price: number; unit: string; categoryName?: string }
  | { ok: false; error: string };

const lookupByNameSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
});

const lookupByIdSchema = z.object({
  id: z.string().trim().min(1, "Thiếu mã sản phẩm."),
});

export async function lookupProductAction(
  _prev: LookupState | null,
  formData: FormData,
): Promise<LookupState> {
  const id = formData.get("id");
  if (id && typeof id === "string") {
    const parsed = lookupByIdSchema.safeParse({ id });
    if (parsed.success) {
      const product = await prisma.product.findUnique({
        where: { id: parsed.data.id },
        include: { category: true },
      });
      if (product)
        return {
          ok: true,
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          categoryName: product.category?.name,
        };
    }
  }

  const parsed = lookupByNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const product = await prisma.product.findFirst({
    where: { name: parsed.data.name },
    include: { category: true },
  });
  if (!product) return { ok: false, error: "Không tìm thấy sản phẩm." };

  return {
    ok: true,
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    categoryName: product.category?.name,
  };
}

const upsertSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
  price: z.coerce
    .number()
    .int()
    .min(0, "Giá phải là số nguyên không âm."),
  unit: z.string().trim().default(""),
});

const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên loại sản phẩm."),
});

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  await prisma.category.create({ data: { name: parsed.data.name } });
  revalidatePath("/admin");
}

const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1),
});

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  await prisma.category.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/admin");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Thiếu mã loại.");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const categoryId = formData.get("categoryId");
  const parsed = upsertSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    unit: formData.get("unit") ?? "",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

  const { name, price, unit } = parsed.data;
  const data: { name: string; price: number; unit: string; categoryId?: string } = {
    name,
    price: price * 1000,
    unit,
  };
  if (categoryId && typeof categoryId === "string") data.categoryId = categoryId;
  await prisma.product.create({ data });
  revalidatePath("/admin");
}

const updateSchema = upsertSchema.extend({
  id: z.string().min(1),
});

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    price: formData.get("price"),
    unit: formData.get("unit") ?? "",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

  const { id, name, price, unit } = parsed.data;
  const categoryId = formData.get("categoryId");
  const updateData: { name: string; price: number; unit: string; categoryId?: string | null } = {
    name,
    price: price * 1000,
    unit,
  };
  if (categoryId !== undefined) updateData.categoryId = categoryId ? String(categoryId) : null;
  await prisma.product.update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Thiếu mã sản phẩm.");

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function importProductsAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("bulk") ?? "");
  const categoryId = formData.get("categoryId") ? String(formData.get("categoryId")) : undefined;
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error("Không có dữ liệu để import.");
  }

  const records: { name: string; price: number; unit: string }[] = [];

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const [name, priceStr, unit = ""] = parts;
    const price = Number(priceStr);
    if (!name || !Number.isFinite(price)) continue;
    // Nhập 15 -> lưu 15000
    records.push({ name, price: Math.round(price) * 1000, unit });
  }

  if (records.length === 0) {
    throw new Error("Không có dòng hợp lệ (định dạng: tên,giá,đơn_vị).");
  }

  for (const r of records) {
    const existing = await prisma.product.findFirst({
      where: { name: r.name, ...(categoryId ? { categoryId } : { categoryId: null }) },
    });
    if (existing)
      await prisma.product.update({
        where: { id: existing.id },
        data: { price: r.price, unit: r.unit },
      });
    else
      await prisma.product.create({
        data: { name: r.name, price: r.price, unit: r.unit, ...(categoryId ? { categoryId } : {}) },
      });
  }

  revalidatePath("/admin");
}

