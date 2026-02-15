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
        include: { category: true, unit: true },
      });
      if (product)
        return {
          ok: true,
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit?.name ?? "",
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
    include: { category: true, unit: true },
  });
  if (!product) return { ok: false, error: "Không tìm thấy sản phẩm." };

  return {
    ok: true,
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit?.name ?? "",
    categoryName: product.category?.name,
  };
}

const upsertSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
  price: z.coerce
    .number()
    .int()
    .min(0, "Giá phải là số nguyên không âm."),
});

const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên loại sản phẩm."),
});

const unitSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên đơn vị."),
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

export async function createUnitAction(formData: FormData) {
  await requireAdmin();
  const parsed = unitSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  await prisma.unit.create({ data: { name: parsed.data.name } });
  revalidatePath("/admin");
}

const updateUnitSchema = unitSchema.extend({
  id: z.string().min(1),
});

export async function updateUnitAction(formData: FormData) {
  await requireAdmin();
  const parsed = updateUnitSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  await prisma.unit.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/admin");
}

export async function deleteUnitAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Thiếu mã đơn vị.");
  await prisma.unit.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const categoryId = formData.get("categoryId");
  const unitId = formData.get("unitId");
  const parsed = upsertSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

  const { name, price } = parsed.data;
  const data: { name: string; price: number; categoryId?: string; unitId?: string } = {
    name,
    price: price * 1000,
  };
  if (categoryId && typeof categoryId === "string") data.categoryId = categoryId;
  if (unitId && typeof unitId === "string") data.unitId = unitId;
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
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

  const { id, name, price } = parsed.data;
  const categoryId = formData.get("categoryId");
  const unitId = formData.get("unitId");
  const updateData: {
    name: string;
    price: number;
    categoryId?: string | null;
    unitId?: string | null;
  } = { name, price: price * 1000 };
  if (categoryId !== undefined) updateData.categoryId = categoryId ? String(categoryId) : null;
  if (unitId !== undefined) updateData.unitId = unitId ? String(unitId) : null;
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

  const records: { name: string; price: number; unitName: string }[] = [];

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const [name, priceStr, unitName = ""] = parts;
    const price = Number(priceStr);
    if (!name || !Number.isFinite(price)) continue;
    records.push({ name, price: Math.round(price) * 1000, unitName });
  }

  if (records.length === 0) {
    throw new Error("Không có dòng hợp lệ (định dạng: tên,giá,đơn_vị).");
  }

  for (const r of records) {
    let unitId: string | null = null;
    if (r.unitName.trim()) {
      const u = await prisma.unit.findFirst({ where: { name: r.unitName.trim() } });
      if (u) unitId = u.id;
      else {
        const created = await prisma.unit.create({ data: { name: r.unitName.trim() } });
        unitId = created.id;
      }
    }
    const existing = await prisma.product.findFirst({
      where: { name: r.name, ...(categoryId ? { categoryId } : { categoryId: null }) },
    });
    if (existing)
      await prisma.product.update({
        where: { id: existing.id },
        data: { price: r.price, unitId },
      });
    else
      await prisma.product.create({
        data: {
          name: r.name,
          price: r.price,
          ...(categoryId ? { categoryId } : {}),
          ...(unitId ? { unitId } : {}),
        },
      });
  }

  revalidatePath("/admin");
}

