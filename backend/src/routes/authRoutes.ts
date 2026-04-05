import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { AuthService } from '../application/services/authService';
import { AuthController } from '../presentation/controllers/authController';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
});

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login – returns access token; sets HttpOnly refresh cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         description: Rate limit exceeded
 *         headers:
 *           Retry-After:
 *             schema:
 *               type: integer
 */
router.post('/login', loginRateLimit, authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange the refresh-token cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Clear the refresh-token cookie and end the session
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Session ended; refresh cookie cleared
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully; refresh cookie cleared
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/password', authenticate, authController.changePassword);

export default router;
