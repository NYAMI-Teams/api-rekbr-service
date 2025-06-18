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

 await prisma.user.createMany({
    data: [
      {
        id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
        email: "buyer@gmail.com",
        password: "$2a$12$WNPs0wziKX.9lLBikRLnA.uKmXQ6bhYjhsYZAhWXBSxJzjtGCCOGe", // testing123
        kyc_status: "unverified",
        status: "inactive",
        is_admin: false,
      },
      {
        id: "s1s1s1s1-s1s1-s1s1-s1s1-s1s1s1s1s1s1",
        email: "seller@gmail.com",
        password: "$2a$12$cxENfGn7ncbjloYdHjcRC.pJNgS.c2DoQ5EtHbz29/8xTRd9KcHie", // testing123
        kyc_status: "unverified",
        status: "inactive",
        is_admin: false,
      },
      {
        id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        email: "admin@gmail.com",
        password: "$2a$12$590YcijWhxc/g3L3/htA0.3Ydo32h8SdE5qSVguCLKWSoFQpTNmou", // testing123
        kyc_status: "verified",
        status: "active",
        is_admin: true,
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

  await prisma.courierList.createMany({
    data: [
      { name: "J&T Express Indonesia" },
      { name: "JNE REG" },
      { name: "SiCepat Ekspres" },
      { name: "AnterAja" },
      { name: "Ninja Xpress" },
      { name: "POS Indonesia" },
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

await prisma.complaint.createMany({
  data: [
    {
      transaction_id: "37a70b2d-7dac-4d3e-a8c5-c9415d33f47f",
      buyer_id: "dd1964c4-5bf2-4414-87d1-0853bf02f14e",
      type: "DAMAGED", // example type
      status: "WAITING_SELLER_APPROVAL",   // example status
      buyer_evidence_urls: JSON.stringify(["https://example.com/buyer-evidence-1.jpg"]),
      seller_evidence_urls: JSON.stringify(["https://example.com/seller-evidence-1.jpg"]),
      buyer_requested_confirmation_at: new Date("2025-06-18T06:48:27.832Z"),
      resolved_at: null,
      created_at: new Date("2025-06-18T03:48:27.877Z"),
      updated_at: new Date("2025-06-18T03:48:27.877Z"),
      buyer_requested_confirmation_evidence_urls: JSON.stringify(["https://example.com/buyer-confirm-evidence-1.jpg"]),
      buyer_requested_confirmation_reason: null,
      seller_confirm_deadline: new Date("2025-06-19T03:48:27.877Z"),
      buyer_reason: "Salah Barang coooo",
      seller_response_reason: null,
    },
    {
      transaction_id: "786348ae-9944-4bc0-afb6-d628710542f8",
      buyer_id: "c75b850d-dbaa-4f96-a337-1fa0f25bf45d",
      type: "NOT_AS_DESCRIBED",
      status: "WAITING_SELLER_APPROVAL",
      buyer_evidence_urls: JSON.stringify(["https://example.com/buyer-evidence-2.jpg"]),
      seller_evidence_urls: JSON.stringify(["https://example.com/seller-evidence-2.jpg"]),
      buyer_requested_confirmation_at: new Date("2025-06-18T06:53:24.022Z"),
      resolved_at: null,
      created_at: new Date("2025-06-18T03:53:24.213Z"),
      updated_at: new Date("2025-06-18T03:53:24.213Z"),
      buyer_requested_confirmation_evidence_urls: JSON.stringify(["https://example.com/buyer-confirm-evidence-2.jpg"]),
      buyer_requested_confirmation_reason: null,
      seller_confirm_deadline: new Date("2025-06-19T03:53:24.213Z"),
      buyer_reason: "ini barang apaan cooooo",
      seller_response_reason: null,
    },
    {
      transaction_id: "786348ae-9944-4bc0-afb6-d628710542f8",
      buyer_id: "755a349b-04bb-4264-ab7b-f9256d1e6654",
      type: "NOT_AS_DESCRIBED",
      status: "WAITING_SELLER_APPROVAL",
      buyer_evidence_urls: JSON.stringify(["https://example.com/buyer-evidence-2.jpg"]),
      seller_evidence_urls: JSON.stringify(["https://example.com/seller-evidence-2.jpg"]),
      buyer_requested_confirmation_at: new Date("2025-06-18T06:53:24.022Z"),
      resolved_at: null,
      created_at: new Date("2025-06-18T03:53:24.213Z"),
      updated_at: new Date("2025-06-18T03:53:24.213Z"),
      buyer_requested_confirmation_evidence_urls: JSON.stringify(["https://example.com/buyer-confirm-evidence-2.jpg"]),
      buyer_requested_confirmation_reason: null,
      seller_confirm_deadline: new Date("2025-06-19T03:53:24.213Z"),
      buyer_reason: "Duplicate charge",
      seller_response_reason: "Refund processed",
    },
  ],
  skipDuplicates: true,
});