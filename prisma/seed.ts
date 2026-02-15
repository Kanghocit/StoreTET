import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const userEmail = "user@example.com";

  const adminPassword = "Admin123!";
  const userPassword = "User123!";

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(userPassword, 12),
  ]);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: { email: adminEmail, passwordHash: adminHash, role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: { passwordHash: userHash, role: Role.USER },
    create: { email: userEmail, passwordHash: userHash, role: Role.USER },
  });

  // Xóa toàn bộ sản phẩm và loại sản phẩm cũ (giữ lại User)
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
