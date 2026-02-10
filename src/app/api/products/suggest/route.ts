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
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
    },
    orderBy: { name: "asc" },
    take: 10,
  });

  return NextResponse.json({ items });
}

