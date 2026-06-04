import axios from 'axios';
import { z } from 'zod';

export type ApiError = unknown;

export const retryUnlessUnauthorized = (
  _failureCount: number,
  error: ApiError,
) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return false;
  }

  return true;
};

export function handleApiError(error: ApiError, withLog = false) {
  if (withLog) {
    void error;
  }
}

export async function apiGet<T extends z.ZodTypeAny>(
  endpoint: string,
  schema: T,
  config?: Parameters<typeof axios.get>[1],
): Promise<z.infer<T>> {
  const response = await axios.get(endpoint, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(config?.headers ?? {}),
    },
  });

  const parsed = schema.parse(response.data);

  return parsed as z.infer<T>;
}
