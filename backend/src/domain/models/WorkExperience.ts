export interface WorkExperienceData {
  id?: number;
  candidateId?: number;
  company?: string;
  title?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  description?: string;
}

export class WorkExperience {
  id?: number;
  candidateId?: number;
  company?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;

  constructor(data: WorkExperienceData) {
    this.id = data.id;
    this.candidateId = data.candidateId;
    this.company = data.company;
    this.title = data.title;
    this.startDate = data.startDate ? new Date(data.startDate) : undefined;
    this.endDate = data.endDate ? new Date(data.endDate) : undefined;
    this.description = data.description;
  }
}
