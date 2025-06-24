import { transactionQueue } from "../queues/transaction.queue.js";

const scheduleAutoCancelShipment = async (transactionId, shipmentDeadline) => {
  const deadlineTime = new Date(shipmentDeadline).getTime();
  const now = Date.now();
  const delay = deadlineTime - now;

  console.log("🚀 Delay ms dihitung sebagai:", deadlineTime - now);

  if (isNaN(deadlineTime) || delay <= 0) {
    console.warn(
      `⚠️ Tidak dapat menjadwalkan auto-cancel shipment: deadline tidak valid atau telah lewat.`
    );
    return;
  }

  await transactionQueue.add(
    "auto-cancel-shipment",
    { transactionId },
    {
      delay,
      jobId: `shipment-cancel:${transactionId}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log("🕒 Jadwal shipment deadline:", shipmentDeadline.toISOString());

  console.log(
    `📌 Job auto-cancel shipment transaksi ${transactionId} dijadwalkan dalam ${delay} ms`
  );
};

const scheduleAutoCancelTransaction = async (
  transactionId,
  paymentDeadline
) => {
  const deadlineTime = new Date(paymentDeadline).getTime();
  const now = Date.now();
  const delay = deadlineTime - now;

  if (isNaN(deadlineTime) || delay <= 0) {
    console.warn(
      `⚠️ Tidak dapat menjadwalkan auto-cancel: deadline tidak valid atau telah lewat.`
    );
    return;
  }

  await transactionQueue.add(
    "auto-cancel-payment",
    { transactionId },
    {
      delay,
      jobId: `cancel:${transactionId}`, // ✅ pakai backtick
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(
    `📌 Job auto-cancel transaksi ${transactionId} dijadwalkan dalam ${delay} ms`
  );
};

const scheduleAutoCompleteTransaction = async (
  transactionId,
  confirmDeadline
) => {
  const deadlineTime = new Date(confirmDeadline).getTime();
  const now = Date.now();
  const delay = deadlineTime - now;

  if (isNaN(deadlineTime) || delay <= 0) {
    console.warn(
      `⚠️ Tidak dapat menjadwalkan auto-complete: deadline tidak valid atau sudah lewat.`
    );
    return;
  }

  await transactionQueue.add(
    "auto-complete-if-not-confirmed",
    { transactionId },
    {
      delay,
      jobId: `auto-complete:${transactionId}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(
    "🕒 Jadwal buyer confirm deadline:",
    confirmDeadline.toISOString()
  );
  console.log("🕒 Now saat schedule dipanggil:", new Date().toISOString());

  console.log(
    `📌 Auto-complete transaksi ${transactionId} dijadwalkan dalam ${delay} ms`
  );
};

export {
  scheduleAutoCancelShipment,
  scheduleAutoCancelTransaction,
  scheduleAutoCompleteTransaction,
};
