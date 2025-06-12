import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function generateTransactionCode() {
  const digits = "0123456789";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let numbersPart = "";
  let lettersPart = "";

  for (let i = 0; i < 5; i++) {
    numbersPart += digits[Math.floor(Math.random() * digits.length)];
  }

  for (let i = 0; i < 3; i++) {
    lettersPart += letters[Math.floor(Math.random() * letters.length)];
  }

  return numbersPart + lettersPart;
}

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
  const bni = await prisma.bankList.findFirst({
    where: { bank_name: "Bank Negara Indonesia" },
  });
  const bri = await prisma.bankList.findFirst({
    where: { bank_name: "Bank Rakyat Indonesia" },
  });

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

  // 🔹 Ambil User
  const buyer = await prisma.user.findFirst({
    where: { email: "buyer@gmail.com" },
  });
  const seller = await prisma.user.findFirst({
    where: { email: "seller@gmail.com" },
  });

  if (!buyer || !seller) {
    console.error("❌ Buyer atau Seller belum ada di database.");
    return;
  }

  // 🔹 Tambahkan Bank Account jika belum ada
  let sellerBankAccount = await prisma.bankAccount.findFirst({
    where: { user_id: seller.id },
  });

  if (!sellerBankAccount) {
    sellerBankAccount = await prisma.bankAccount.create({
      data: {
        user_id: seller.id,
        bank_id: bni?.id || "",
        account_number: "1122334455",
        account_holder_name: "Seller Example",
      },
    });
  }

  // 🔹 Cek apakah transaksi sudah ada
  const existingTxn = await prisma.transaction.findFirst({
    where: {
      seller_id: seller.id,
      buyer_id: buyer.id,
      item_name: "Produk Tes",
    },
  });

  if (!existingTxn) {
    await prisma.transaction.create({
      data: {
        transaction_code: generateTransactionCode(),
        seller_id: seller.id,
        buyer_id: buyer.id,
        item_name: "Produk Tes",
        item_price: 200000,
        platform_fee: 5000,
        insurance_fee: 1000,
        total_amount: 206000,
        status: "pending_payment",
        virtual_account_number: "1234567890123456",
        withdrawal_bank_account_id: sellerBankAccount.id,
      },
    });
  }

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
