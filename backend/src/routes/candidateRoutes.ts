import { Router } from 'express';
import { CandidateController } from '../presentation/controllers/candidateController';
import { CandidateService } from '../application/services/candidateService';
import { PrismaCandidateRepository } from '../infrastructure/repositories/PrismaCandidateRepository';
import { PrismaCandidateCvRepository } from '../infrastructure/repositories/PrismaCandidateCvRepository';
import { LocalStorageService } from '../infrastructure/storage/LocalStorageService';
import { authenticate, requireRole } from '../middleware/auth';
import { handleCvUpload } from '../middleware/upload';
import prisma from '../infrastructure/prismaClient';

const candidateRepo = new PrismaCandidateRepository(prisma);
const cvRepo = new PrismaCandidateCvRepository(prisma);
const storage = new LocalStorageService();
const service = new CandidateService(candidateRepo, cvRepo, storage);
const controller = new CandidateController(service);

const router = Router();

/**
 * @openapi
 * /api/v1/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateCandidateRequest'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCandidateRequest'
 *     responses:
 *       201:
 *         description: Candidate created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       413:
 *         $ref: '#/components/responses/PayloadTooLarge'
 */
router.post(
  '/',
  authenticate,
  requireRole('recruiter', 'admin'),
  handleCvUpload,
  controller.createCandidate,
);

/**
 * @openapi
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Get a candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, requireRole('recruiter', 'admin'), controller.getCandidateById);

/**
 * @openapi
 * /api/v1/candidates/{id}/cv:
 *   post:
 *     summary: Upload or replace a CV for a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cvFile]
 *             properties:
 *               cvFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: CV uploaded
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       413:
 *         $ref: '#/components/responses/PayloadTooLarge'
 */
router.post(
  '/:id/cv',
  authenticate,
  requireRole('recruiter', 'admin'),
  handleCvUpload,
  controller.uploadCv,
);

export default router;
