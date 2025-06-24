export const removeJobIfExists = async (queue, jobId) => {
  try {
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(
        `✅ Job ${jobId} berhasil dihapus dari antrean "${queue.name}".`
      );
    } else {
      console.log(
        `ℹ️ Job ${jobId} tidak ditemukan di antrean "${queue.name}".`
      );
    }
  } catch (err) {
    console.error(`❌ Gagal menghapus job ${jobId}:`, err.message);
    throw err;
  }
};
