export interface EducationInput {
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
}

export interface WorkExperienceInput {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
  education?: EducationInput[];
  workExperience?: WorkExperienceInput[];
  cvFile?: File;
}

export interface CvMetadata {
  id: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface EducationRecord {
  id: number;
  degree?: string | null;
  institution?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface WorkExperienceRecord {
  id: number;
  company?: string | null;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface CandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  educations: EducationRecord[];
  workExperiences: WorkExperienceRecord[];
  cv: CvMetadata | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
