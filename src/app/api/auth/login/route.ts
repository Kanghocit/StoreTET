import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Vui lòng nhập email và mật khẩu hợp lệ." },
        { status: 400 },
      );
    }

    const { email, password, remember } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Email hoặc mật khẩu không đúng." },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Email hoặc mật khẩu không đúng." },
        { status: 401 },
      );
    }

    await createSession(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      { remember: remember === true },
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/login error", err);
    return NextResponse.json(
      { ok: false, error: "Đã xảy ra lỗi, vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}

