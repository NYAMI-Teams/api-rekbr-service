import multer from "multer";

const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const videoMimeTypes = [
  "video/mp4",
  "video/avi",
  "video/mkv",
  "video/mp4",
  "video/mov",
  "video/wmv",
  "video/flv",
  "video/webm",
  "video/quicktime",
];

const fileFilter = (req, file, cb) => {
  if (
    imageMimeTypes.includes(file.mimetype) ||
    videoMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (jpg, jpeg, png, webp) atau video (mp4, avi, mkv) yang diperbolehkan"
      ),
      false
    );
  }
};

const storage = multer.memoryStorage();
// const limits = { fileSize: 10 * 1024 * 1024 }; //limit for images
const baseUpload = multer({ storage, fileFilter });

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
    (fieldName = "files", maxCount = 10, maxTotalSizeMB = 100) =>
    (req, res, next) => {
      baseUpload.array(fieldName, maxCount)(req, res, (err) => {
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
