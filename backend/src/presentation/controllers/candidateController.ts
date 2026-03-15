import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../../application/services/candidateService';
import { validateCreateCandidateInput } from '../../application/validators/candidateValidator';
import { AppError } from '../../application/errors';
import { Logger } from '../../infrastructure/logger';

const logger = new Logger('candidateController');

export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  createCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = validateCreateCandidateInput(req.body);

      const cvFile = req.file
        ? {
            buffer: req.file.buffer,
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            size: req.file.size,
          }
        : undefined;

      const { candidate, cv } = await this.candidateService.createCandidate(
        { ...validated, createdBy: req.user!.userId },
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
          createdBy: candidate.createdBy,
          educations: candidate.educations,
          workExperiences: candidate.workExperiences,
          cv: cv
            ? {
                id: cv.id,
                filename: cv.filename,
                contentType: cv.contentType,
                size: cv.size,
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
          createdBy: candidate.createdBy,
          educations: candidate.educations,
          workExperiences: candidate.workExperiences,
          cv: candidate.currentCv
            ? {
                id: candidate.currentCv.id,
                filename: candidate.currentCv.filename,
                contentType: candidate.currentCv.contentType,
                size: candidate.currentCv.size,
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
          size: cv.size,
          uploadedAt: cv.uploadedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
