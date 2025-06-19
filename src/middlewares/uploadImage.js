import multer from "multer";

const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan"),
      false
    );
  }
};

const storage = multer.memoryStorage();
const limits = { fileSize: 2 * 1024 * 1024 };
const baseUpload = multer({ storage, limits, fileFilter });

const uploadImage = {
  single:
    (fieldName = "image", maxSizeMB = 2) =>
    (req, res, next) => {
      baseUpload.single(fieldName)(req, res, (err) => {
        if (err?.code === "LIMIT_FILE_SIZE") {
          return next(new Error(`Ukuran file maksimal ${maxSizeMB}MB`));
        }
        if (err) return next(new Error(err.message));

        const file = req.file;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file && file.size > maxSizeBytes) {
          return next(
            new Error(`Ukuran file tidak boleh lebih dari ${maxSizeMB}MB`)
          );
        }

        next();
      });
    },

  array:
    (fieldName = "images", maxCount = 5, maxTotalSizeMB = 10) =>
    (req, res, next) => {
      baseUpload.array(fieldName, maxCount)(req, res, (err) => {
        if (err?.code === "LIMIT_FILE_SIZE") {
          return next(new Error("Ukuran file maksimal 2MB per file"));
        }
        if (err) return next(new Error(err.message));

        const totalSize = (req.files || []).reduce(
          (acc, file) => acc + file.size,
          0
        );
        const maxTotalSize = maxTotalSizeMB * 1024 * 1024;

        if (totalSize > maxTotalSize) {
          return next(
            new Error(
              `Total ukuran file tidak boleh lebih dari ${maxTotalSizeMB}MB`
            )
          );
        }

        next();
      });
    },

  fields: (fields) => (req, res, next) => {
    baseUpload.fields(fields)(req, res, (err) => {
      if (err?.code === "LIMIT_FILE_SIZE") {
        return next(new Error("Ukuran file maksimal 2MB"));
      }
      if (err) return next(new Error(err.message));
      next();
    });
  },
};

export default uploadImage;
