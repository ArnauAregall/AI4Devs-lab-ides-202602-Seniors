import { Request, Response, NextFunction } from 'express';
import { AppError, ApiErrorBody } from '../application/errors';
import { Logger } from '../infrastructure/logger';

const logger = new Logger('errorHandler');

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if ('fieldErrors' in err && typeof (err as Record<string, unknown>).fieldErrors === 'object') {
      body.error.fieldErrors = (err as Record<string, unknown>).fieldErrors as Record<string, string>;
    }

    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code });
    }

    res.status(err.statusCode).json(body);
    return;
  }

  logger.error('Unexpected error', {
    error: err instanceof Error ? err.message : String(err),
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  } satisfies ApiErrorBody);
}
