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
  
  // Ambil ID bank untuk digunakan di dummyAccount
  const bni = await prisma.bankList.findFirst({ where: { bank_name: "Bank Negara Indonesia" } });
  const bri = await prisma.bankList.findFirst({ where: { bank_name: "Bank Rakyat Indonesia" } });

  // Seeder untuk dummyAccount
  await prisma.dummyAccount.createMany({
    data: [
      {
        bank_id: bni?.id || "", // Pastikan bank_id tidak null
        account_number: "1234567890",
        account_name: "BNI Dummy",
      },
      {
        bank_id: bri?.id || "",
        account_number: "0987654321",
        account_name: "BRI Dummy",
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
