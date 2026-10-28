import createClient from 'openapi-fetch';
import type { paths } from 'src/types/api-schema';

const authToken = () => {
  return sessionStorage.getItem('jwt-token') || localStorage.getItem('jwt-token');
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
      const bodyBuffer = await response.arrayBuffer();
      const bodyText = new TextDecoder('utf-8').decode(bodyBuffer);
      const responseJson = JSON.parse(bodyText);
      if (responseJson.message?.[0] === 'invalid-admin-password-error') {
        return new Response(bodyBuffer, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
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

type JsonBody<Operation> = Operation extends {
  requestBody?: {
    content?: {
      'application/json'?: infer Body;
    };
  };
}
  ? Body
  : never;

export type PostJsonBody<Path extends keyof paths> = paths[Path] extends { post: infer Operation }
  ? JsonBody<Operation>
  : never;

export default {
  get: client.GET,
  post: client.POST,
  delete: client.DELETE,
  patch: client.PATCH,
  put: client.PUT,
};
