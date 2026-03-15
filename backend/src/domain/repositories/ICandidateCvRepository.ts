import { CandidateCv } from '../models/CandidateCv';

export interface ICandidateCvRepository {
  save(cv: CandidateCv): Promise<CandidateCv>;
  deactivateForCandidate(candidateId: number): Promise<void>;
  linkCurrentCvToCandidate(candidateId: number, cvId: number): Promise<void>;
}
