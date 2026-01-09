/**
 * Error Handling Middleware
 * Centralized error handling with comprehensive logging and user-friendly responses
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger, errorLogger } from '../config/logger';
import { AppError, ErrorCodes, ApiResponse } from '../types';

/**
 * Global error handler middleware
 * Handles all types of errors and provides consistent API responses
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with context
  errorLogger.apiError(error, req, req.user?.userId);

  // Handle different types of errors
  if (error instanceof AppError) {
    handleAppError(error, res);
  } else if (error instanceof ZodError) {
    handleValidationError(error, res);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    handlePrismaValidationError(error, res);
  } else if (error.name === 'JsonWebTokenError') {
    handleJWTError(error, res);
  } else if (error.name === 'TokenExpiredError') {
    handleTokenExpiredError(error, res);
  } else if (error.name === 'MulterError') {
    handleMulterError(error, res);
  } else {
    handleGenericError(error, res);
  }
};

/**
 * Handle custom application errors
 */
const handleAppError = (error: AppError, res: Response): void => {
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  } as ApiResponse);
};

/**
 * Handle Zod validation errors
 */
const handleValidationError = (error: ZodError, res: Response): void => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  res.status(400).json({
    success: false,
    message: 'Validation failed',
    code: ErrorCodes.VALIDATION_ERROR,
    errors,
  } as ApiResponse);
};

/**
 * Handle Prisma database errors
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError, res: Response): void => {
  let statusCode = 500;
  let message = 'Database error occurred';
  let code = ErrorCodes.INTERNAL_SERVER_ERROR;

  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      statusCode = 409;
      message = 'A record with this information already exists';
      code = ErrorCodes.DUPLICATE_RESOURCE;
      break;

    case 'P2025':
      // Record not found
      statusCode = 404;
      message = 'The requested resource was not found';
      code = ErrorCodes.RESOURCE_NOT_FOUND;
      break;

    case 'P2003':
      // Foreign key constraint violation
      statusCode = 400;
      message = 'Invalid reference to related resource';
      code = ErrorCodes.VALIDATION_ERROR;
      break;

    case 'P2004':
      // Constraint violation
      statusCode = 400;
      message = 'Data constraint violation';
      code = ErrorCodes.VALIDATION_ERROR;
      break;

    case 'P2014':
      // Required relation violation
      statusCode = 400;
      message = 'Required relationship is missing';
      code = ErrorCodes.VALIDATION_ERROR;
      break;

    case 'P2021':
      // Table does not exist
      statusCode = 500;
      message = 'Database configuration error';
      code = ErrorCodes.INTERNAL_SERVER_ERROR;
      break;

    case 'P2022':
      // Column does not exist
      statusCode = 500;
      message = 'Database schema error';
      code = ErrorCodes.INTERNAL_SERVER_ERROR;
      break;

    default:
      logger.error('Unhandled Prisma error', { 
        code: error.code, 
        message: error.message 
      });
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { 
      prismaCode: error.code,
      details: error.message 
    }),
  } as ApiResponse);
};

/**
 * Handle Prisma validation errors
 */
const handlePrismaValidationError = (error: Prisma.PrismaClientValidationError, res: Response): void => {
  res.status(400).json({
    success: false,
    message: 'Invalid data provided',
    code: ErrorCodes.VALIDATION_ERROR,
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  } as ApiResponse);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: Error, res: Response): void => {
  res.status(401).json({
    success: false,
    message: 'Invalid authentication token',
    code: ErrorCodes.AUTHENTICATION_FAILED,
  } as ApiResponse);
};

/**
 * Handle JWT expiration errors
 */
const handleTokenExpiredError = (error: Error, res: Response): void => {
  res.status(401).json({
    success: false,
    message: 'Authentication token has expired',
    code: ErrorCodes.AUTHENTICATION_FAILED,
  } as ApiResponse);
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (error: any, res: Response): void => {
  let statusCode = 400;
  let message = 'File upload error';
  let code = ErrorCodes.FILE_UPLOAD_ERROR;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File size too large';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded';
      break;
    case 'LIMIT_FIELD_KEY':
      message = 'Field name too long';
      break;
    case 'LIMIT_FIELD_VALUE':
      message = 'Field value too long';
      break;
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      break;
    case 'MISSING_FIELD_NAME':
      message = 'Missing field name';
      break;
    default:
      message = error.message || 'File upload failed';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
  } as ApiResponse);
};

/**
 * Handle generic/unknown errors
 */
const handleGenericError = (error: Error, res: Response): void => {
  // Log unexpected errors for investigation
  logger.error('Unexpected error', { 
    name: error.name,
    message: error.message,
    stack: error.stack 
  });

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    }),
  } as ApiResponse);
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: ErrorCodes.RESOURCE_NOT_FOUND,
  } as ApiResponse);
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to the error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error helper
 * Creates standardized validation error responses
 */
export const createValidationError = (message: string, field?: string): AppError => {
  const error = new AppError(message, 400, true, ErrorCodes.VALIDATION_ERROR);
  if (field) {
    (error as any).field = field;
  }
  return error;
};

/**
 * Not found error helper
 * Creates standardized not found error responses
 */
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(
    `${resource} not found`,
    404,
    true,
    ErrorCodes.RESOURCE_NOT_FOUND
  );
};

/**
 * Unauthorized error helper
 * Creates standardized unauthorized error responses
 */
export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(
    message,
    401,
    true,
    ErrorCodes.AUTHENTICATION_FAILED
  );
};

/**
 * Forbidden error helper
 * Creates standardized forbidden error responses
 */
export const createForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(
    message,
    403,
    true,
    ErrorCodes.AUTHORIZATION_FAILED
  );
};

/**
 * Conflict error helper
 * Creates standardized conflict error responses
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(
    message,
    409,
    true,
    ErrorCodes.DUPLICATE_RESOURCE
  );
};

/**
 * Rate limit error helper
 * Creates standardized rate limit error responses
 */
export const createRateLimitError = (message: string = 'Rate limit exceeded'): AppError => {
  return new AppError(
    message,
    429,
    true,
    ErrorCodes.RATE_LIMIT_EXCEEDED
  );
};

/**
 * Internal server error helper
 * Creates standardized internal server error responses
 */
export const createInternalServerError = (message: string = 'Internal server error'): AppError => {
  return new AppError(
    message,
    500,
    false,
    ErrorCodes.INTERNAL_SERVER_ERROR
  );
};