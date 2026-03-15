export interface CandidateCvData {
  id?: number;
  candidateId?: number;
  storageKey: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt?: Date | string;
  isActive?: boolean;
}

export class CandidateCv {
  id?: number;
  candidateId?: number;
  storageKey: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  isActive: boolean;

  constructor(data: CandidateCvData) {
    this.id = data.id;
    this.candidateId = data.candidateId;
    this.storageKey = data.storageKey;
    this.filename = data.filename;
    this.contentType = data.contentType;
    this.size = data.size;
    this.uploadedAt = data.uploadedAt ? new Date(data.uploadedAt) : new Date();
    this.isActive = data.isActive ?? true;
  }
}
