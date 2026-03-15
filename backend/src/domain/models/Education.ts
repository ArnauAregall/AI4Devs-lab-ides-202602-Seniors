export interface EducationData {
  id?: number;
  candidateId?: number;
  degree?: string;
  institution?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export class Education {
  id?: number;
  candidateId?: number;
  degree?: string;
  institution?: string;
  startDate?: Date;
  endDate?: Date;

  constructor(data: EducationData) {
    this.id = data.id;
    this.candidateId = data.candidateId;
    this.degree = data.degree;
    this.institution = data.institution;
    this.startDate = data.startDate ? new Date(data.startDate) : undefined;
    this.endDate = data.endDate ? new Date(data.endDate) : undefined;
  }
}
