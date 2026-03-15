import { PrismaClient } from '@prisma/client';
import { ICandidateCvRepository } from '../../domain/repositories/ICandidateCvRepository';
import { CandidateCv } from '../../domain/models/CandidateCv';

export class PrismaCandidateCvRepository implements ICandidateCvRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(cv: CandidateCv): Promise<CandidateCv> {
    const record = await this.prisma.candidateCv.create({
      data: {
        candidateId: cv.candidateId!,
        storageKey: cv.storageKey,
        filename: cv.filename,
        contentType: cv.contentType,
        size: cv.size,
        isActive: cv.isActive,
      },
    });
    return new CandidateCv(record);
  }

  async deactivateForCandidate(candidateId: number): Promise<void> {
    await this.prisma.candidateCv.updateMany({
      where: { candidateId, isActive: true },
      data: { isActive: false },
    });
  }

  async linkCurrentCvToCandidate(candidateId: number, cvId: number): Promise<void> {
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { currentCvId: cvId },
    });
  }
}
