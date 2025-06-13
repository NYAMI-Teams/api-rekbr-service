import upload from "../utils/multer.js";
import throwError from "../utils/throwError.js";

// Factory middleware upload image
const uploadImage = (fieldName = "image") => (req, res, next) => {
    upload.single(fieldName)(req, res, function (err) {
        if (err && err.code === "LIMIT_FILE_SIZE") {
            return next(new Error("Ukuran file maksimal 2MB"));
        }
        if (err) {
            return next(new Error(err.message));
        }
        next();
    });
};

export default uploadImage;