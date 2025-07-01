import downloadService from "../services/download.service.js";
import throwError from "../utils/throwError.js";

const downloadFile = async (req, res) => {
  const { url, filename = "file-download.jpg" } = req.query;
  if (!url) throwError("URL file tidak disediakan", 400);

  try {
    await downloadService.proxyDownload(url, filename, res);
  } catch (err) {
    console.error("Download error:", err);
    throwError("Gagal mengunduh file", 500);
  }
};

export default { downloadFile };
