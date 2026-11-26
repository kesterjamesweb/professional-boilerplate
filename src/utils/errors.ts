export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(
    message = 'Validation failed',
    details?: any,
    errorCode = 'VALIDATION_ERROR'
  ) {
    super(message, 400, errorCode);
    this.details = details;
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR') {
    super(message, 500, errorCode, false);
  }
}