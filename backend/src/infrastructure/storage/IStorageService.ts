export interface StoredFile {
  storageKey: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface IStorageService {
  store(buffer: Buffer, filename: string, contentType: string): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}
