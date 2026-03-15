import { PrismaClient } from '@prisma/client';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { Candidate, CandidateData } from '../../domain/models/Candidate';

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        currentCv: true,
      },
    });
    return record ? new Candidate(record as unknown as CandidateData) : null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { email },
      include: {
        educations: true,
        workExperiences: true,
        currentCv: true,
      },
    });
    return record ? new Candidate(record as unknown as CandidateData) : null;
  }

  async save(candidate: Candidate): Promise<Candidate> {
    const record = await this.prisma.candidate.create({
      data: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone ?? null,
        address: candidate.address ?? null,
        source: candidate.source ?? null,
        notes: candidate.notes ?? null,
        createdBy: candidate.createdBy,
        educations: {
          create: candidate.educations.map((e) => ({
            degree: e.degree ?? null,
            institution: e.institution ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
          })),
        },
        workExperiences: {
          create: candidate.workExperiences.map((w) => ({
            company: w.company ?? null,
            title: w.title ?? null,
            startDate: w.startDate ?? null,
            endDate: w.endDate ?? null,
            description: w.description ?? null,
          })),
        },
      },
      include: {
        educations: true,
        workExperiences: true,
        currentCv: true,
      },
    });
    return new Candidate(record as unknown as CandidateData);
  }
}
