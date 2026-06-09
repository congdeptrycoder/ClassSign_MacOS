import { Response } from 'express';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string
) {
  const body: ApiResponse<never> = {
    success: false,
    message,
  };

  return res.status(statusCode).json(body);
}
