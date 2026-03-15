import { CandidateService } from './candidateService';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { ICandidateCvRepository } from '../../domain/repositories/ICandidateCvRepository';
import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { Candidate } from '../../domain/models/Candidate';
import { CandidateCv } from '../../domain/models/CandidateCv';
import { ConflictError, NotFoundError } from '../errors';

const mockCandidateRepo: jest.Mocked<ICandidateRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
};

const mockCvRepo: jest.Mocked<ICandidateCvRepository> = {
  save: jest.fn(),
  deactivateForCandidate: jest.fn(),
  linkCurrentCvToCandidate: jest.fn(),
};

const mockStorage: jest.Mocked<IStorageService> = {
  store: jest.fn(),
  delete: jest.fn(),
};

const service = new CandidateService(mockCandidateRepo, mockCvRepo, mockStorage);

const validInput = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  createdBy: 'recruiter-1',
};

const savedCandidate = new Candidate({ id: 1, ...validInput });

describe('CandidateService - createCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('should_create_candidate_when_valid_input_without_cv', () => {
    it('should persist and return the new candidate', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(null);
      mockCandidateRepo.save.mockResolvedValue(savedCandidate);

      const result = await service.createCandidate(validInput);

      expect(result.candidate).toBeInstanceOf(Candidate);
      expect(result.candidate.id).toBe(1);
      expect(result.cv).toBeNull();
      expect(mockCandidateRepo.save).toHaveBeenCalledTimes(1);
      expect(mockCvRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('should_create_candidate_with_cv_when_file_provided', () => {
    it('should store CV and link it to the new candidate', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(null);
      mockCandidateRepo.save.mockResolvedValue(savedCandidate);
      mockStorage.store.mockResolvedValue({
        storageKey: 'cvs/uuid.pdf',
        filename: 'my-cv.pdf',
        contentType: 'application/pdf',
        size: 1024,
      });
      const savedCv = new CandidateCv({
        id: 5,
        candidateId: 1,
        storageKey: 'cvs/uuid.pdf',
        filename: 'my-cv.pdf',
        contentType: 'application/pdf',
        sizeBytes: 1024,
      });
      mockCvRepo.save.mockResolvedValue(savedCv);
      mockCvRepo.linkCurrentCvToCandidate.mockResolvedValue();

      const result = await service.createCandidate(validInput, {
        buffer: Buffer.from('pdf-content'),
        filename: 'my-cv.pdf',
        contentType: 'application/pdf',
        size: 1024,
      });

      expect(result.candidate).toBeInstanceOf(Candidate);
      expect(result.cv).toBeInstanceOf(CandidateCv);
      expect(result.cv?.id).toBe(5);
      expect(mockStorage.store).toHaveBeenCalledTimes(1);
      expect(mockCvRepo.save).toHaveBeenCalledTimes(1);
      expect(mockCvRepo.linkCurrentCvToCandidate).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('should_throw_ConflictError_when_email_already_exists', () => {
    it('should reject with ConflictError for duplicate email', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(savedCandidate);

      await expect(service.createCandidate(validInput)).rejects.toThrow(ConflictError);
    });

    it('should include DUPLICATE_EMAIL code in the conflict error', async () => {
      mockCandidateRepo.findByEmail.mockResolvedValue(savedCandidate);
      try {
        await service.createCandidate(validInput);
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictError);
        expect((err as ConflictError).code).toBe('DUPLICATE_EMAIL');
      }
    });
  });
});

describe('CandidateService - getCandidateById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the candidate when found', async () => {
    mockCandidateRepo.findById.mockResolvedValue(savedCandidate);

    const result = await service.getCandidateById(1);

    expect(result).toBeInstanceOf(Candidate);
    expect(result.id).toBe(1);
  });

  it('should throw NotFoundError when candidate does not exist', async () => {
    mockCandidateRepo.findById.mockResolvedValue(null);

    await expect(service.getCandidateById(999)).rejects.toThrow(NotFoundError);
  });
});

describe('CandidateService - uploadCvForCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should deactivate old CVs and link the new one', async () => {
    mockCandidateRepo.findById.mockResolvedValue(savedCandidate);
    mockStorage.store.mockResolvedValue({
      storageKey: 'cvs/new-uuid.pdf',
      filename: 'new-cv.pdf',
      contentType: 'application/pdf',
      size: 2048,
    });
    const newCv = new CandidateCv({
      id: 10,
      candidateId: 1,
      storageKey: 'cvs/new-uuid.pdf',
      filename: 'new-cv.pdf',
      contentType: 'application/pdf',
      sizeBytes: 2048,
    });
    mockCvRepo.save.mockResolvedValue(newCv);
    mockCvRepo.deactivateForCandidate.mockResolvedValue();
    mockCvRepo.linkCurrentCvToCandidate.mockResolvedValue();

    const result = await service.uploadCvForCandidate(1, {
      buffer: Buffer.from('new-pdf'),
      filename: 'new-cv.pdf',
      contentType: 'application/pdf',
      size: 2048,
    });

    expect(result).toBeInstanceOf(CandidateCv);
    expect(mockCvRepo.deactivateForCandidate).toHaveBeenCalledWith(1);
    expect(mockCvRepo.linkCurrentCvToCandidate).toHaveBeenCalledWith(1, 10);
  });

  it('should throw NotFoundError when candidate does not exist', async () => {
    mockCandidateRepo.findById.mockResolvedValue(null);

    await expect(
      service.uploadCvForCandidate(999, {
        buffer: Buffer.from('pdf'),
        filename: 'cv.pdf',
        contentType: 'application/pdf',
        size: 100,
      })
    ).rejects.toThrow(NotFoundError);
  });
});
