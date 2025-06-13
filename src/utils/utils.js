export const sanitizeFileName = (fileName) => {
    // Hapus whitespace, karakter spesial, dan ganti spasi dengan underscore
    return fileName
        .replace(/\s+/g, "_")           // Ganti spasi dengan underscore
        .replace(/[^a-zA-Z0-9._-]/g, "") // Hanya izinkan huruf, angka, titik, underscore, dash
        .replace(/_+/g, "_");           // Gabungkan underscore berurutan
};