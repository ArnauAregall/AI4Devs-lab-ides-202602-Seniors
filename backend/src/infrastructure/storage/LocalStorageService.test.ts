import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { LocalStorageService } from './LocalStorageService';

describe('LocalStorageService', () => {
  let uploadDir: string;
  let service: LocalStorageService;

  beforeEach(async () => {
    uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-test-'));
    service = new LocalStorageService(uploadDir);
  });

  afterEach(async () => {
    await fs.rm(uploadDir, { recursive: true, force: true });
  });

  describe('store', () => {
    it('should write the file and return storage metadata', async () => {
      const buffer = Buffer.from('fake pdf content');
      const result = await service.store(buffer, 'resume.pdf', 'application/pdf');

      expect(result.filename).toBe('resume.pdf');
      expect(result.contentType).toBe('application/pdf');
      expect(result.size).toBe(buffer.length);
      expect(result.storageKey).toMatch(/^cvs\/.+\.pdf$/);

      const filePath = path.join(uploadDir, path.basename(result.storageKey));
      const written = await fs.readFile(filePath);
      expect(written).toEqual(buffer);
    });

    it('should create the upload directory if it does not exist', async () => {
      const nestedDir = path.join(uploadDir, 'nested', 'subdir');
      const nestedService = new LocalStorageService(nestedDir);

      const result = await nestedService.store(Buffer.from('content'), 'cv.pdf', 'application/pdf');

      expect(result.size).toBe(7);
    });
  });

  describe('delete', () => {
    it('should delete an existing file', async () => {
      const buffer = Buffer.from('to delete');
      const stored = await service.store(buffer, 'delete-me.pdf', 'application/pdf');

      await service.delete(stored.storageKey);

      const filePath = path.join(uploadDir, path.basename(stored.storageKey));
      await expect(fs.access(filePath)).rejects.toThrow();
    });

    it('should not throw when deleting a non-existent file', async () => {
      await expect(service.delete('cvs/does-not-exist.pdf')).resolves.not.toThrow();
    });
  });
});
