import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IStorageService, StoredFile } from './IStorageService';

export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir ?? process.env.CV_UPLOAD_DIR ?? path.join(process.cwd(), 'uploads', 'cvs');
  }

  async store(buffer: Buffer, filename: string, contentType: string): Promise<StoredFile> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = path.extname(filename);
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}${ext}`;
    const storageKey = path.join('cvs', safeFilename);
    const fullPath = path.join(this.uploadDir, safeFilename);

    await fs.writeFile(fullPath, buffer);

    return {
      storageKey,
      filename,
      contentType,
      size: buffer.length,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const safeFilename = path.basename(storageKey);
    const fullPath = path.join(this.uploadDir, safeFilename);
    try {
      await fs.unlink(fullPath);
    } catch {
      // Best-effort: ignore if already deleted
    }
  }
}
