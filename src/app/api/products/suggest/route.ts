import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: 15,
  });

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      categoryName: p.category?.name ?? undefined,
    })),
  });
}

