import { PrismaCandidateCvRepository } from './PrismaCandidateCvRepository';
import { CandidateCv } from '../../domain/models/CandidateCv';

const mockPrisma = {
  candidateCv: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  candidate: {
    update: jest.fn(),
  },
} as unknown as import('@prisma/client').PrismaClient;

const repository = new PrismaCandidateCvRepository(mockPrisma);

describe('PrismaCandidateCvRepository - save', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should persist and return the created CandidateCv', async () => {
    const cvRow = {
      id: 5,
      candidateId: 1,
      storageKey: 'uploads/cv.pdf',
      filename: 'cv.pdf',
      contentType: 'application/pdf',
      sizeBytes: BigInt(102400),
      uploadedAt: new Date('2024-03-01'),
      isActive: true,
    };
    (mockPrisma.candidateCv.create as jest.Mock).mockResolvedValue(cvRow);

    const cv = new CandidateCv({
      candidateId: 1,
      storageKey: 'uploads/cv.pdf',
      filename: 'cv.pdf',
      contentType: 'application/pdf',
      sizeBytes: 102400,
    });

    const result = await repository.save(cv);

    expect(result).toBeInstanceOf(CandidateCv);
    expect(result.id).toBe(5);
    expect(result.sizeBytes).toBe(BigInt(102400));
    expect(mockPrisma.candidateCv.create).toHaveBeenCalledTimes(1);
  });
});

describe('PrismaCandidateCvRepository - deactivateForCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should mark all active CVs for a candidate as inactive', async () => {
    (mockPrisma.candidateCv.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await repository.deactivateForCandidate(1);

    expect(mockPrisma.candidateCv.updateMany).toHaveBeenCalledWith({
      where: { candidateId: 1, isActive: true },
      data: { isActive: false },
    });
  });
});

describe('PrismaCandidateCvRepository - linkCurrentCvToCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update candidate with current CV id', async () => {
    (mockPrisma.candidate.update as jest.Mock).mockResolvedValue({});

    await repository.linkCurrentCvToCandidate(1, 5);

    expect(mockPrisma.candidate.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { currentCvId: 5 },
    });
  });
});
