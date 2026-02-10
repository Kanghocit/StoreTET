import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KhangStore - Tra cứu giá & quản lý sản phẩm",
  description:
    "Tra cứu giá sản phẩm, nhập đơn và quản lý kho với phân quyền admin/user.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionPromise = getSession();
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-linear-to-b from-zinc-50 via-zinc-50 to-zinc-100 text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white shadow-sm dark:bg-zinc-50 dark:text-black">
                  KS
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight sm:text-base">
                    KhangStore
                  </span>
                  <span className="hidden text-[11px] text-zinc-500 sm:block">
                    Tra cứu giá & nhập đơn nhanh
                  </span>
                </span>
              </Link>
              <nav className="flex items-center gap-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
                <Link
                  href="/"
                  className="rounded-full px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Tra cứu
                </Link>
                {/** Session-dependent links below */}
                <SessionNav sessionPromise={sessionPromise} />
              </nav>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-6 sm:px-4 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-200/70 bg-white/60 py-3 text-center text-[11px] text-zinc-500 backdrop-blur dark:border-zinc-800 dark:bg-black/60 dark:text-zinc-500 sm:text-xs">
            © {new Date().getFullYear()} KhangStore
          </footer>
        </div>
      </body>
    </html>
  );
}

async function SessionNav({
  sessionPromise,
}: {
  sessionPromise: ReturnType<typeof getSession>;
}) {
  const session = await sessionPromise;

  if (!session) {
    return (
      <Link href="/login" className="hover:text-zinc-950 dark:hover:text-white">
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.role === "ADMIN" ? (
        <Link
          href="/admin"
          className="hover:text-zinc-950 dark:hover:text-white"
        >
          Admin
        </Link>
      ) : null}
      <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
        {session.email} ({session.role.toLowerCase()})
      </span>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Logout
        </button>
      </form>
    </div>
  );
}
