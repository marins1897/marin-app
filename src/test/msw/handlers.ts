import type { RequestHandler } from 'msw';

/**
 * One handler per `api/` endpoint. The template has no endpoints yet; add
 * `http.get(...)` entries here as `src/api/` grows and override per test with
 * `server.use(...)`.
 */
export const handlers: RequestHandler[] = [];
