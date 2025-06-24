import { Worker } from "bullmq";
import prisma from "../prisma/client.js";
import redisClient from "../services/redisClient.js";

const worker = new Worker(
  "transaction-queue",
  async (job) => {
    console.log(`🔄 Memproses job ${job.id}:`, job.name);
    console.log(new Date().toISOString(), " - Job data:", job.data);
    if (job.name === "auto-cancel-payment") {
      const { transactionId } = job.data;

      const txn = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (txn && txn.status === "pending_payment") {
        console.log(
          `⏰ Transaksi ${transactionId} belum dibayar, membatalkan otomatis...`
        );
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: "canceled",
            cancelled_at: new Date(),
            cancel_reason: "Canceled karena tidak dibayar tepat waktu",
          },
        });
        console.log(
          `📌 Transaksi ${transactionId} otomatis dibatalkan karena tidak dibayar tepat waktu`
        );
      }
    }

    if (job.name === "auto-cancel-shipment") {
      const { transactionId } = job.data;
      const txn = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (txn && txn.status === "waiting_shipment") {
        console.log(
          `⏰ Transaksi ${transactionId} belum dikirim, membatalkan otomatis...`
        );
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: "canceled",
            cancelled_at: new Date(),
            cancel_reason: "Canceled karena seller tidak kirim tepat waktu",
          },
        });

        console.log("📦 [AutoCancelShipment] Eksekusi job:", {
          now: new Date().toISOString(),
          shipmentDeadlineFromDB: txn.shipment_deadline?.toISOString(),
          executedAt: new Date().toISOString(),
        });

        console.log("🧭 Date.now() saat eksekusi:", Date.now());

        console.log(
          `📌 Transaksi ${transactionId} otomatis dibatalkan karena seller tidak mengirimkan barang`
        );
      }
    }

    if (job.name === "auto-complete-if-not-confirmed") {
      const { transactionId } = job.data;
      const txn = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (
        txn &&
        txn.status === "shipped" &&
        txn.buyer_confirm_deadline &&
        new Date(txn.buyer_confirm_deadline) <= new Date()
      ) {
        const amountToWithdraw =
          txn.total_amount - txn.platform_fee - txn.insurance_fee;

        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: "completed",
            confirmed_at: new Date(),
            withdrawn_at: new Date(),
            withdrawn_amount: amountToWithdraw,
          },
        });

        console.log(
          `✅ Transaksi ${transactionId} otomatis diselesaikan karena buyer tidak konfirmasi tepat waktu`
        );
      }
    }
  },
  {
    connection: redisClient.options,
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} selesai:`, job.name);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} gagal:`, job.name, err);
});
