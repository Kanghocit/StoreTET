## KhangStore (Next.js 16)

### English

Role-based product management app:

- **User**: can only lookup product price by product name
- **Admin**: can add/edit/delete products

Tech:

- **Next.js**: `16.x canary` (App Router, Server Actions)
- **DB**: SQLite
- **ORM**: Prisma
- **Auth**: HttpOnly cookie session (JWT via `jose`) + roles (`USER`, `ADMIN`)

### Vietnamese (Tiếng Việt)

Ứng dụng quản lý sản phẩm có phân quyền:

- **User**: chỉ được tra cứu giá sản phẩm theo tên
- **Admin**: có quyền thêm / sửa / xóa sản phẩm

Công nghệ:

- **Next.js**: `16.x canary` (App Router, Server Actions)
- **DB**: SQLite
- **ORM**: Prisma
- **Đăng nhập**: session cookie HttpOnly (JWT bằng `jose`) + role (`USER`, `ADMIN`)

---

## Setup / Cài đặt

### 1) Install dependencies / Cài dependencies

```bash
npm install
```

### 2) Configure env / Cấu hình env

File: `.env`

- **DATABASE_URL**: `file:./dev.db`
- **AUTH_SECRET**: set a strong secret in production

### 3) Migrate + seed DB / Tạo DB + seed dữ liệu

```bash
npx prisma migrate dev --name init
```

### 4) Run dev server / Chạy dev

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Seeded accounts / Tài khoản có sẵn

- **Admin**
- **User**
  - Email: `user@local`
  - Password: `User123!`

---

## Usage / Cách dùng

- **Tra cứu**: go to `/` and enter a product name (seeded: `iPhone`, `MacBook`, `AirPods`)
- **Admin**: login with the admin account, then open `/admin` to manage products

---

## Useful commands / Lệnh hữu ích

```bash
npm run prisma:studio
npm run db:seed
npm run lint
npm run build
```
