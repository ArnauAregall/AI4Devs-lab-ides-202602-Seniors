import { Candidate } from './Candidate';
import { Education } from './Education';
import { WorkExperience } from './WorkExperience';
import { CandidateCv } from './CandidateCv';

describe('Candidate', () => {
  describe('constructor', () => {
    it('should create a candidate with required fields', () => {
      const candidate = new Candidate({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        createdBy: 'recruiter-1',
      });

      expect(candidate.firstName).toBe('Jane');
      expect(candidate.lastName).toBe('Doe');
      expect(candidate.email).toBe('jane.doe@example.com');
      expect(candidate.createdBy).toBe('recruiter-1');
      expect(candidate.educations).toEqual([]);
      expect(candidate.workExperiences).toEqual([]);
    });

    it('should create a candidate with all optional fields', () => {
      const education = new Education({
        degree: 'BSc Computer Science',
        institution: 'MIT',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-01'),
      });
      const workExp = new WorkExperience({
        company: 'Acme Corp',
        title: 'Engineer',
        startDate: new Date('2022-07-01'),
        description: 'Built things',
      });

      const candidate = new Candidate({
        id: 42,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+34600000000',
        address: '123 Main St',
        source: 'LinkedIn',
        notes: 'Strong candidate',
        createdBy: 'recruiter-1',
        createdAt: new Date('2024-01-01'),
        educations: [education],
        workExperiences: [workExp],
      });

      expect(candidate.id).toBe(42);
      expect(candidate.phone).toBe('+34600000000');
      expect(candidate.address).toBe('123 Main St');
      expect(candidate.source).toBe('LinkedIn');
      expect(candidate.notes).toBe('Strong candidate');
      expect(candidate.educations).toHaveLength(1);
      expect(candidate.workExperiences).toHaveLength(1);
    });

    it('should populate updatedAt from data when provided', () => {
      const updatedAt = new Date('2025-06-01T10:00:00.000Z');
      const candidate = new Candidate({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        createdBy: 'recruiter-1',
        updatedAt,
      });

      expect(candidate.updatedAt).toEqual(updatedAt);
    });

    it('should default updatedAt to current time when not provided', () => {
      const before = new Date();
      const candidate = new Candidate({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        createdBy: 'recruiter-1',
      });
      const after = new Date();

      expect(candidate.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(candidate.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});

describe('Education', () => {
  it('should create an education entry with optional fields', () => {
    const edu = new Education({
      degree: 'MSc',
      institution: 'Stanford',
      startDate: new Date('2020-09-01'),
      endDate: new Date('2022-06-01'),
    });

    expect(edu.degree).toBe('MSc');
    expect(edu.institution).toBe('Stanford');
    expect(edu.endDate).toEqual(new Date('2022-06-01'));
  });

  it('should allow missing optional fields', () => {
    const edu = new Education({});
    expect(edu.degree).toBeUndefined();
    expect(edu.institution).toBeUndefined();
    expect(edu.startDate).toBeUndefined();
    expect(edu.endDate).toBeUndefined();
  });
});

describe('WorkExperience', () => {
  it('should create a work experience entry', () => {
    const exp = new WorkExperience({
      company: 'ACME',
      title: 'Senior Dev',
      startDate: new Date('2020-01-01'),
      description: 'Led the team',
    });

    expect(exp.company).toBe('ACME');
    expect(exp.title).toBe('Senior Dev');
    expect(exp.endDate).toBeUndefined();
  });
});

describe('CandidateCv', () => {
  it('should create a CV metadata record with sizeBytes as bigint', () => {
    const cv = new CandidateCv({
      id: 1,
      candidateId: 10,
      storageKey: 'uploads/2024/cv-abc123.pdf',
      filename: 'my-cv.pdf',
      contentType: 'application/pdf',
      sizeBytes: 204800,
      uploadedAt: new Date('2024-06-01'),
      isActive: true,
    });

    expect(cv.id).toBe(1);
    expect(cv.storageKey).toBe('uploads/2024/cv-abc123.pdf');
    expect(cv.contentType).toBe('application/pdf');
    expect(cv.sizeBytes).toBe(BigInt(204800));
    expect(cv.isActive).toBe(true);
  });

  it('should accept bigint directly for sizeBytes', () => {
    const cv = new CandidateCv({
      storageKey: 'cvs/test.pdf',
      filename: 'test.pdf',
      contentType: 'application/pdf',
      sizeBytes: BigInt(1048576),
    });

    expect(cv.sizeBytes).toBe(BigInt(1048576));
  });
});
