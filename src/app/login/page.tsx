import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Đăng nhập
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
          Đăng nhập để quản lý sản phẩm và nhập đơn.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <LoginForm nextUrl={params.next} />
      </div>

      <div className="mt-4 space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div>
          Tài khoản mẫu:
          <span className="ml-1 font-mono">admin@example.com / Admin123!</span>
        </div>
        <div>
          <span className="font-medium">Admin</span>: thêm/sửa/xóa sản phẩm ·{" "}
          <span className="font-medium">User</span>: chỉ tra cứu & tạo bill.
        </div>
      </div>
    </div>
  );
}

