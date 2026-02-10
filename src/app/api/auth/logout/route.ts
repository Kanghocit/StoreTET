import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/logout error", err);
    return NextResponse.json(
      { ok: false, error: "Đã xảy ra lỗi, vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}

