import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "../config/constants.js";

// Ensure the upload directory exists
const uploadDir = path.resolve("public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Handles multer errors so they flow through the global error handler.
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(
          400,
          `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        ),
      );
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};
