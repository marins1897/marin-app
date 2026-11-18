export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
  ) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = 'HttpError';
  }
}

/** Thin JSON fetcher: the only place in the app that calls `fetch`. */
export const getJson = async <T>(
  url: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new HttpError(response.status, url);
  return (await response.json()) as T;
};
