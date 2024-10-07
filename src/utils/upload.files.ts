import multer from "multer";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        return cb(null, "./uploads");
    },
    filename(req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({ storage });