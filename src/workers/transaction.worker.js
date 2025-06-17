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
            cancel_reason: "Auto-cancel karena tidak dibayar tepat waktu",
          },
        });
        console.log(
          `📌 Transaksi ${transactionId} otomatis dibatalkan karena tidak dibayar tepat waktu`
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
