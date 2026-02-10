import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";

export type Session = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
};

const SESSION_COOKIE = "session";

type CreateSessionOptions = {
  /**
   * If true, persist the session longer (remember me).
   * If false/undefined, use a session cookie + shorter JWT expiry.
   */
  remember?: boolean;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session, opts?: CreateSessionOptions) {
  const remember = opts?.remember === true;
  const maxAgeSeconds = remember ? 60 * 60 * 24 * 30 : undefined; // 30 days
  const jwtExpiry = remember ? "30d" : "1d";

  const token = await new SignJWT({
    email: session.email,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(jwtExpiry)
    .sign(getSecretKey());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (typeof userId !== "string") return null;
    if (typeof email !== "string") return null;
    if (role !== "USER" && role !== "ADMIN") return null;

    return { userId, email, role };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");
  return session;
}

