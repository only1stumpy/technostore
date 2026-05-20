export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode: number, code: string) {
    super(message, statusCode, code);
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InvalidCodeError extends AuthError {
  constructor(message = 'Invalid verification code') {
    super(message, 400, 'INVALID_CODE');
  }
}

export class InvalidCursorError extends AppError {
  constructor(message = 'Invalid cursor') {
    super(message, 400, 'INVALID_CURSOR');
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, 'CONFIGURATION_ERROR');
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
