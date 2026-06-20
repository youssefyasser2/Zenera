import { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ status: 'success', data });
}

export function error(res: Response, message = 'Error', status = 400) {
  return res.status(status).json({ status: 'error', message });
}