import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../../application/services/candidateService';
import { validateCreateCandidateInput } from '../../application/validators/candidateValidator';
import { AppError } from '../../application/errors';
import { Logger } from '../../infrastructure/logger';

const logger = new Logger('candidateController');

/**
 * When the request is multipart/form-data, multer places all non-file fields
 * in req.body as strings. The `education` and `workExperience` fields are
 * JSON-serialised arrays on the client side, so we attempt to parse them back
 * to arrays before validation.
 */
function parseJsonStringFields(body: Record<string, unknown>): Record<string, unknown> {
  const parsed = { ...body };
  for (const field of ['education', 'workExperience'] as const) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        // Leave the value as-is; Zod will produce a meaningful validation error.
      }
    }
  }
  return parsed;
}

export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  createCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = validateCreateCandidateInput(
        parseJsonStringFields(req.body as Record<string, unknown>),
      );

      const cvFile = req.file
        ? {
            buffer: req.file.buffer,
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            size: req.file.size,
          }
        : undefined;

      const { candidate, cv } = await this.candidateService.createCandidate(
        { ...validated, createdBy: String(req.user!.userId) },
        cvFile,
      );

      logger.info('POST /api/v1/candidates success', { candidateId: candidate.id });

      res.status(201).json({
        success: true,
        data: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone ?? null,
          address: candidate.address ?? null,
          source: candidate.source ?? null,
          notes: candidate.notes ?? null,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
          createdBy: candidate.createdBy,
          educations: candidate.educations,
          workExperiences: candidate.workExperiences,
          cv: cv
            ? {
                id: cv.id,
                filename: cv.filename,
                contentType: cv.contentType,
                sizeBytes: Number(cv.sizeBytes),
                uploadedAt: cv.uploadedAt,
              }
            : null,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getCandidateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        next(new AppError('VALIDATION_ERROR', 'Invalid candidate id', 400));
        return;
      }

      const candidate = await this.candidateService.getCandidateById(id);

      res.status(200).json({
        success: true,
        data: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone ?? null,
          address: candidate.address ?? null,
          source: candidate.source ?? null,
          notes: candidate.notes ?? null,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
          createdBy: candidate.createdBy,
          educations: candidate.educations,
          workExperiences: candidate.workExperiences,
          cv: candidate.currentCv
            ? {
                id: candidate.currentCv.id,
                filename: candidate.currentCv.filename,
                contentType: candidate.currentCv.contentType,
                sizeBytes: Number(candidate.currentCv.sizeBytes),
                uploadedAt: candidate.currentCv.uploadedAt,
              }
            : null,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  uploadCv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        next(new AppError('VALIDATION_ERROR', 'CV file is required', 400));
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        next(new AppError('VALIDATION_ERROR', 'Invalid candidate id', 400));
        return;
      }

      const cv = await this.candidateService.uploadCvForCandidate(id, {
        buffer: req.file.buffer,
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
      });

      logger.info('POST /api/v1/candidates/:id/cv success', { candidateId: id });

      res.status(201).json({
        success: true,
        data: {
          id: cv.id,
          filename: cv.filename,
          contentType: cv.contentType,
          sizeBytes: Number(cv.sizeBytes),
          uploadedAt: cv.uploadedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
