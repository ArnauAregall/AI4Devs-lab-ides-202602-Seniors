import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { ICandidateCvRepository } from '../../domain/repositories/ICandidateCvRepository';
import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { Candidate } from '../../domain/models/Candidate';
import { CandidateCv } from '../../domain/models/CandidateCv';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { ConflictError, NotFoundError } from '../errors';
import { ValidatedCreateCandidateInput } from '../validators/candidateValidator';
import { Logger } from '../../infrastructure/logger';

export interface CvUploadInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
  size: number;
}

export interface CreateCandidateResult {
  candidate: Candidate;
  cv: CandidateCv | null;
}

const logger = new Logger('candidateService');

export class CandidateService {
  constructor(
    private readonly candidateRepo: ICandidateRepository,
    private readonly cvRepo: ICandidateCvRepository,
    private readonly storage: IStorageService,
  ) {}

  async createCandidate(
    input: ValidatedCreateCandidateInput & { createdBy: string },
    cvFile?: CvUploadInput,
  ): Promise<CreateCandidateResult> {
    const existing = await this.candidateRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A candidate with this email already exists', 'DUPLICATE_EMAIL');
    }

    const candidate = new Candidate({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      source: input.source,
      notes: input.notes,
      createdBy: input.createdBy,
      educations: (input.education ?? []).map((e) => new Education(e)),
      workExperiences: (input.workExperience ?? []).map((w) => new WorkExperience(w)),
    });

    const savedCandidate = await this.candidateRepo.save(candidate);
    logger.info('Candidate created', { candidateId: savedCandidate.id });

    if (!cvFile) {
      return { candidate: savedCandidate, cv: null };
    }

    const cv = await this.storeCv(savedCandidate.id!, cvFile);
    return { candidate: savedCandidate, cv };
  }

  async getCandidateById(id: number): Promise<Candidate> {
    const candidate = await this.candidateRepo.findById(id);
    if (!candidate) {
      throw new NotFoundError(`Candidate with id ${id} not found`);
    }
    return candidate;
  }

  async uploadCvForCandidate(candidateId: number, cvFile: CvUploadInput): Promise<CandidateCv> {
    const candidate = await this.candidateRepo.findById(candidateId);
    if (!candidate) {
      throw new NotFoundError(`Candidate with id ${candidateId} not found`);
    }

    await this.cvRepo.deactivateForCandidate(candidateId);
    return this.storeCv(candidateId, cvFile);
  }

  private async storeCv(candidateId: number, cvFile: CvUploadInput): Promise<CandidateCv> {
    const stored = await this.storage.store(cvFile.buffer, cvFile.filename, cvFile.contentType);
    logger.info('CV stored', { candidateId, storageKey: stored.storageKey });

    const cv = new CandidateCv({
      candidateId,
      storageKey: stored.storageKey,
      filename: stored.filename,
      contentType: stored.contentType,
      sizeBytes: stored.size,
    });

    const savedCv = await this.cvRepo.save(cv);
    await this.cvRepo.linkCurrentCvToCandidate(candidateId, savedCv.id!);
    return savedCv;
  }
}
