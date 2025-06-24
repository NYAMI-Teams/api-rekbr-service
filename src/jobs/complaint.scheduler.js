import { complaintQueue } from "../queues/complaint.queue.js";

export const scheduleAutoCancelComplaint = async (complaintId, delay) => {
  if (typeof delay !== "number" || delay <= 0) {
    console.warn("⚠️ Delay tidak valid, job tidak dijadwalkan.");
    return;
  }

  await complaintQueue.add(
    "auto-cancel-return-shipment",
    { complaintId },
    {
      delay,
      jobId: `cancel-return-shipment:${complaintId}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(
    `📌 Job auto-cancel retur shipment untuk complaint ${complaintId} dijadwalkan dalam ${delay} ms`
  );
};

export const scheduleAutoCompleteConfirmation = async (complaintId, delay) => {
  await complaintQueue.add(
    "auto-admin-complete-confirmation",
    { complaintId },
    {
      delay,
      jobId: `confirm-return-deadline:${complaintId}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};
