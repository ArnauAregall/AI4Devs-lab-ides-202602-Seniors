import multer from 'multer';
import { FileTooLargeError, UnsupportedFileTypeError } from '../application/errors';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_CV_SIZE_BYTES = parseInt(process.env.CV_MAX_SIZE_BYTES ?? String(5 * 1024 * 1024), 10);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_CV_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new UnsupportedFileTypeError(`Unsupported file type: ${file.mimetype}. Only PDF and DOCX are accepted.`));
      return;
    }
    cb(null, true);
  },
});

export function handleCvUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('cvFile')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new FileTooLargeError(`CV file exceeds the maximum allowed size of ${MAX_CV_SIZE_BYTES} bytes`));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}
