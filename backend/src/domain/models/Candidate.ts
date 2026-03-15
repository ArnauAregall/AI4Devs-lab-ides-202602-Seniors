import { Education, EducationData } from './Education';
import { WorkExperience, WorkExperienceData } from './WorkExperience';
import { CandidateCv, CandidateCvData } from './CandidateCv';

export interface CandidateData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
  createdAt?: Date | string;
  createdBy: string;
  currentCvId?: number;
  educations?: EducationData[];
  workExperiences?: WorkExperienceData[];
  cvs?: CandidateCvData[];
  currentCv?: CandidateCvData | null;
}

export class Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
  currentCvId?: number;
  educations: Education[];
  workExperiences: WorkExperience[];
  cvs: CandidateCv[];
  currentCv?: CandidateCv | null;

  constructor(data: CandidateData) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.source = data.source;
    this.notes = data.notes;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.createdBy = data.createdBy;
    this.currentCvId = data.currentCvId;
    this.educations = (data.educations ?? []).map((e) => new Education(e));
    this.workExperiences = (data.workExperiences ?? []).map((w) => new WorkExperience(w));
    this.cvs = (data.cvs ?? []).map((c) => new CandidateCv(c));
    this.currentCv = data.currentCv ? new CandidateCv(data.currentCv) : null;
  }
}
