export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string>,
  ) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(code, message, 409);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FileTooLargeError extends AppError {
  constructor(message: string) {
    super('FILE_TOO_LARGE', message, 413);
    this.name = 'FileTooLargeError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(message: string) {
    super('UNSUPPORTED_FILE_TYPE', message, 400);
    this.name = 'UnsupportedFileTypeError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
