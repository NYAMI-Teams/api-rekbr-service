import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.bankList.createMany({
    data: [
      {
        bank_name: "Bank Negara Indonesia",
        logo_url: "https://example.com/logo/bni.png",
      },
      {
        bank_name: "Bank Rakyat Indonesia",
        logo_url: "https://example.com/logo/bri.png",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
