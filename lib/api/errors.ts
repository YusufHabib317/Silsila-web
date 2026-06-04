import { FALLBACK_ERROR_MESSAGE } from '@/data';

import { ApiRequestError } from './client';

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return FALLBACK_ERROR_MESSAGE;
}
