import createClient from 'openapi-fetch';
import type { BadRequestErrorEnum, InternalServerErrorEnum, paths } from 'src/types/api-schema';

const authToken = () => {
  return sessionStorage.getItem('jwt-token') || localStorage.getItem('jwt-token');
};

const authHeader = () => {
  const token = authToken();
  return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
};

const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});

client.use({
  async onRequest({ request }) {
    const token = authToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      sessionStorage.removeItem('jwt-token');
      localStorage.removeItem('jwt-token');
      if (window.location.pathname !== '/signin') {
        const returnUrl = window.location.pathname + window.location.search + window.location.hash;
        window.location.assign(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    }
    return response;
  },
});

export default {
  authHeader,
  get: client.GET,
  post: client.POST,
  delete: client.DELETE,
  patch: client.PATCH,
  put: client.PUT,
};

export type ErrorResponse<T> = {
  message: (T | GenericErrorCodes)[];
};

export class TypedApiError<T> extends Error {
  messages: (T | GenericErrorCodes)[];

  constructor(messages: (T | GenericErrorCodes)[], type: string) {
    super(type);
    this.messages = messages;
  }
}

export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message?: unknown };
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallbackMessage ?? 'Request failed';
}

export type GenericErrorCodes = InternalServerErrorEnum.internal_server_error | BadRequestErrorEnum.bad_request_error;
