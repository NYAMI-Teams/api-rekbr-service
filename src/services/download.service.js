import fetch from "node-fetch";

const proxyDownload = async (url, filename, res) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("File tidak ditemukan");

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const buffer = await response.buffer();

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
};

export default { proxyDownload };
