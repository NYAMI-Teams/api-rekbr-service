import { Worker } from "bullmq";
import prisma from "../prisma/client.js";
import redisClient from "../services/redisClient.js";
import transactionRepo from "../repositories/transaction.repository.js";

const worker = new Worker(
  "complaint-queue",
  async (job) => {
    console.log(`🔄 Memproses job ${job.id}:`, job.name);

    if (job.name === "auto-cancel-return-shipment") {
      const { complaintId } = job.data;

      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });

      if (
        complaint &&
        complaint.status === "return_requested" &&
        complaint.buyer_deadline_input_shipment &&
        new Date(complaint.buyer_deadline_input_shipment) <= new Date()
      ) {
        await prisma.complaint.update({
          where: { id: complaintId },
          data: {
            status: "canceled_by_buyer",
            resolved_at: new Date(),
          },
        });

        if (complaint.transaction_id) {
          await transactionRepo.updateStatus(
            complaint.transaction_id,
            "shipped"
          );
        }

        console.log(
          `🚫 Komplain ${complaintId} dibatalkan otomatis karena buyer tidak input resi`
        );
      }
    }

    if (job.name === "auto-admin-complete-confirmation") {
      const { complaintId } = job.data;

      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });

      if (
        complaint &&
        complaint.status === "awaiting_seller_confirmation" &&
        complaint.seller_confirm_deadline &&
        new Date() >= new Date(complaint.seller_confirm_deadline)
      ) {
        await prisma.complaint.update({
          where: { id: complaintId },
          data: {
            status: "completed",
            resolved_at: new Date(),
          },
        });

        console.log(
          `✅ Komplain ${complaintId} otomatis diselesaikan karena seller tidak merespons tepat waktu`
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
