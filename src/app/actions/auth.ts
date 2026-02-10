"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clearSession, createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional(),
});

function safeNext(next?: string) {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

export async function loginAction(_prev: LoginState, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: "Vui lòng nhập email và mật khẩu hợp lệ." };
  }

  const { email, password, next } = parsed.data;
  const remember = formData.get("remember") === "on";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Email hoặc mật khẩu không đúng." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Email hoặc mật khẩu không đúng." };

  await createSession(
    { userId: user.id, email: user.email, role: user.role },
    { remember },
  );
  redirect(safeNext(next));
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

