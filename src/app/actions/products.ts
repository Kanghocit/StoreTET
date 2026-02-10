"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type LookupState =
  | { ok: true; name: string; price: number; unit: string }
  | { ok: false; error: string };

const lookupSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
});

export async function lookupProductAction(
  _prev: LookupState | null,
  formData: FormData,
): Promise<LookupState> {
  const parsed = lookupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const name = parsed.data.name;
  const product = await prisma.product.findUnique({ where: { name } });
  if (!product) return { ok: false, error: "Không tìm thấy sản phẩm." };

  return { ok: true, name: product.name, price: product.price, unit: product.unit };
}

const upsertSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
  price: z.coerce
    .number()
    .int()
    .min(0, "Giá phải là số nguyên không âm."),
  unit: z.string().trim().default(""),
});

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = upsertSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    unit: formData.get("unit") ?? "",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

  const { name, price, unit } = parsed.data;
  // Lưu theo đơn vị nghìn: nhập 15 -> lưu 15000
  await prisma.product.create({ data: { name, price: price * 1000, unit } });
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
  await prisma.product.update({
    where: { id },
    data: { name, price: price * 1000, unit },
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

  await prisma.$transaction(
    records.map((r) =>
      prisma.product.upsert({
        where: { name: r.name },
        update: { price: r.price, unit: r.unit },
        create: { name: r.name, price: r.price, unit: r.unit },
      }),
    ),
  );

  revalidatePath("/admin");
}

