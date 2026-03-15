import { Request, Response, NextFunction } from 'express';
import { CandidateController } from './candidateController';
import { CandidateService } from '../../application/services/candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { CandidateCv } from '../../domain/models/CandidateCv';
import { ConflictError, NotFoundError, ValidationError } from '../../application/errors';

jest.mock('../../application/services/candidateService');

const mockService = new CandidateService(
  {} as never,
  {} as never,
  {} as never,
) as jest.Mocked<CandidateService>;

const controller = new CandidateController(mockService);

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const next: NextFunction = jest.fn();

const savedCandidate = new Candidate({
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  createdBy: 'user-1',
});

const savedCv = new CandidateCv({
  id: 5,
  candidateId: 1,
  storageKey: 'cvs/uuid.pdf',
  filename: 'cv.pdf',
  contentType: 'application/pdf',
  sizeBytes: 1024,
});

describe('CandidateController - createCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 201 with created candidate when no CV', async () => {
    mockService.createCandidate.mockResolvedValue({ candidate: savedCandidate, cv: null });

    const req = {
      body: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      file: undefined,
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.createCandidate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should return 201 with candidate and CV metadata when CV provided', async () => {
    mockService.createCandidate.mockResolvedValue({ candidate: savedCandidate, cv: savedCv });

    const req = {
      body: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      file: { buffer: Buffer.from('pdf'), originalname: 'cv.pdf', mimetype: 'application/pdf', size: 1024 },
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.createCandidate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.data.cv).not.toBeNull();
  });

  it('should parse education and workExperience JSON strings from multipart body', async () => {
    mockService.createCandidate.mockResolvedValue({ candidate: savedCandidate, cv: null });

    const req = {
      body: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        education: JSON.stringify([{ degree: 'BSc', institution: 'UAB' }]),
        workExperience: JSON.stringify([{ company: 'Acme', title: 'Engineer' }]),
      },
      file: undefined,
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.createCandidate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
    const callArg = (mockService.createCandidate as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(callArg.education)).toBe(true);
    expect(Array.isArray(callArg.workExperience)).toBe(true);
  });

  it('should call next with ValidationError when input is invalid', async () => {
    const req = {
      body: { firstName: '', lastName: 'Doe', email: 'not-an-email' },
      file: undefined,
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.createCandidate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next with ConflictError when email already exists', async () => {
    mockService.createCandidate.mockRejectedValue(new ConflictError('Duplicate', 'DUPLICATE_EMAIL'));

    const req = {
      body: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      file: undefined,
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.createCandidate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ConflictError));
  });
});

describe('CandidateController - getCandidateById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 200 with candidate data when found', async () => {
    mockService.getCandidateById.mockResolvedValue(savedCandidate);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockRes();

    await controller.getCandidateById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should call next with NotFoundError when candidate does not exist', async () => {
    mockService.getCandidateById.mockRejectedValue(new NotFoundError('Not found'));

    const req = { params: { id: '999' } } as unknown as Request;
    const res = mockRes();

    await controller.getCandidateById(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });
});

describe('CandidateController - uploadCv', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 201 with CV metadata when upload succeeds', async () => {
    mockService.uploadCvForCandidate.mockResolvedValue(savedCv);

    const req = {
      params: { id: '1' },
      file: { buffer: Buffer.from('pdf'), originalname: 'new-cv.pdf', mimetype: 'application/pdf', size: 1024 },
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.uploadCv(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should call next with error when no file is provided', async () => {
    const req = {
      params: { id: '1' },
      file: undefined,
      user: { userId: 'user-1', email: 'r@co.com', role: 'recruiter' },
    } as unknown as Request;
    const res = mockRes();

    await controller.uploadCv(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
