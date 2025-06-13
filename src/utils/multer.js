import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Maksimal ukuran file 2MB
  }
});

export default upload;
