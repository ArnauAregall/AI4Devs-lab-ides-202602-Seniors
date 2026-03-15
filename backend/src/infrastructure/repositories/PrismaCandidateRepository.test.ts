import { PrismaCandidateRepository } from './PrismaCandidateRepository';
import { Candidate } from '../../domain/models/Candidate';

const mockPrisma = {
  candidate: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as unknown as import('@prisma/client').PrismaClient;

const repository = new PrismaCandidateRepository(mockPrisma);

const candidateRow = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: null,
  address: null,
  source: null,
  notes: null,
  createdAt: new Date('2024-01-01'),
  createdBy: 'recruiter-1',
  currentCvId: null,
  educations: [],
  workExperiences: [],
  currentCv: null,
};

describe('PrismaCandidateRepository - findById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return a Candidate when record exists', async () => {
    (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(candidateRow);

    const result = await repository.findById(1);

    expect(result).toBeInstanceOf(Candidate);
    expect(result?.id).toBe(1);
    expect(result?.email).toBe('jane@example.com');
    expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
  });

  it('should return null when record does not exist', async () => {
    (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });
});

describe('PrismaCandidateRepository - findByEmail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return a Candidate when email matches', async () => {
    (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(candidateRow);

    const result = await repository.findByEmail('jane@example.com');

    expect(result).toBeInstanceOf(Candidate);
    expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'jane@example.com' } })
    );
  });

  it('should return null when no candidate with that email', async () => {
    (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findByEmail('nobody@example.com');

    expect(result).toBeNull();
  });
});

describe('PrismaCandidateRepository - save', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should persist and return the created Candidate', async () => {
    (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(candidateRow);

    const candidate = new Candidate({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      createdBy: 'recruiter-1',
    });

    const result = await repository.save(candidate);

    expect(result).toBeInstanceOf(Candidate);
    expect(result.id).toBe(1);
    expect(mockPrisma.candidate.create).toHaveBeenCalledTimes(1);
  });

  it('should propagate database errors', async () => {
    (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const candidate = new Candidate({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      createdBy: 'recruiter-1',
    });

    await expect(repository.save(candidate)).rejects.toThrow('DB error');
  });
});
