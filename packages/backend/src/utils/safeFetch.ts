import { config } from '../config/index.js';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  followRedirects?: boolean;
}

export async function safeFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { method = 'GET', headers = {}, body, timeoutMs = config.CHECK_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'ARGUS/1.0 Web Intelligence Scanner',
        ...headers,
      },
      body,
      signal: controller.signal,
      redirect: options.followRedirects === false ? 'manual' : 'follow',
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'Request timed out';
    return error.message;
  }
  return 'Unknown error occurred';
}
