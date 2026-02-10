import { PrismaClient, type Product } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Lấy tất cả sản phẩm mà giá hiện nhỏ hơn 1.000 (coi như đang lưu theo đơn vị nghìn)
  const products = await prisma.product.findMany({
    where: { price: { lt: 1000 } },
  });

  if (products.length === 0) {
    console.log("Không có sản phẩm nào cần cập nhật.");
    return;
  }

  console.log(`Sẽ cập nhật ${products.length} sản phẩm...`);

  await Promise.all(
    products.map((p: Product) =>
      prisma.product.update({
        where: { id: p.id },
        data: { price: p.price * 1000 },
      }),
    ),
  );

  console.log("Đã nhân giá x1000 cho các sản phẩm đó.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

