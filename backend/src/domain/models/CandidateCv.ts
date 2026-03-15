export interface CandidateCvData {
  id?: number;
  candidateId?: number;
  storageKey: string;
  filename: string;
  contentType: string;
  sizeBytes: bigint | number;
  uploadedAt?: Date | string;
  isActive?: boolean;
}

export class CandidateCv {
  id?: number;
  candidateId?: number;
  storageKey: string;
  filename: string;
  contentType: string;
  sizeBytes: bigint;
  uploadedAt: Date;
  isActive: boolean;

  constructor(data: CandidateCvData) {
    this.id = data.id;
    this.candidateId = data.candidateId;
    this.storageKey = data.storageKey;
    this.filename = data.filename;
    this.contentType = data.contentType;
    this.sizeBytes = BigInt(data.sizeBytes);
    this.uploadedAt = data.uploadedAt ? new Date(data.uploadedAt as string) : new Date();
    this.isActive = data.isActive ?? true;
  }
}
