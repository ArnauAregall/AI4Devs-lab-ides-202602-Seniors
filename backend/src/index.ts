import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import candidateRoutes from './routes/candidateRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LTI ATS API',
      version: '1.0.0',
      description: 'LTI Applicant Tracking System API',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateCandidateRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            firstName: { type: 'string', maxLength: 100 },
            lastName: { type: 'string', maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', maxLength: 50 },
            address: { type: 'string', maxLength: 255 },
            source: { type: 'string', maxLength: 100 },
            notes: { type: 'string', maxLength: 2000 },
            cvFile: { type: 'string', format: 'binary' },
          },
        },
        CvMetadata: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            filename: { type: 'string' },
            contentType: { type: 'string' },
            size: { type: 'integer' },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        CandidateResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string', nullable: true },
                address: { type: 'string', nullable: true },
                source: { type: 'string', nullable: true },
                notes: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                createdBy: { type: 'string' },
                educations: { type: 'array', items: { type: 'object' } },
                workExperiences: { type: 'array', items: { type: 'object' } },
                cv: { $ref: '#/components/schemas/CvMetadata', nullable: true },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                fieldErrors: { type: 'object', additionalProperties: { type: 'string' } },
              },
            },
          },
        },
      },
      responses: {
        ValidationError: {
          description: 'Validation failed',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Unauthorized: {
          description: 'Authentication required',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Conflict: {
          description: 'Conflict (e.g. duplicate email)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        PayloadTooLarge: {
          description: 'File too large',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'LTI ATS API is running' });
});

app.use('/api/v1/candidates', candidateRoutes);

app.use(errorHandler);

const port = parseInt(process.env.PORT ?? '3010', 10);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
