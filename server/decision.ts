import { createHash, timingSafeEqual } from 'node:crypto';
import { parseSnapshot, record } from '../src/mind/protocol.ts';
import { reserveBudget } from './budget.ts';
import { requestProposal } from './provider.ts';
import { HttpError, readLimited } from './http.ts';

export type Environment = Record<string, string | undefined>;
function configured(env: Environment): boolean {
  let redis = false;
  try { const url = new URL(env.UPSTASH_REDIS_REST_URL || '');
    redis = url.protocol === 'https:' && url.hostname.endsWith('.upstash.io') && !url.username && !url.password &&
      url.pathname === '/' && !url.search && !url.hash;
  } catch { /* disabled */ }
  return env.ETTA_MIND_ENABLED === 'true' && !!env.GEMINI_API_KEY?.trim() &&
    /^[A-Za-z0-9_-]{32,128}$/.test(env.ETTA_ACCESS_TOKEN || '') && redis && !!env.UPSTASH_REDIS_REST_TOKEN?.trim() &&
    ['gemma-4-26b-a4b-it', 'gemma-4-31b-it'].includes(env.GEMMA_MODEL || 'gemma-4-26b-a4b-it');
}
function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    ...(status === 405 ? { Allow: 'GET, POST' } : {}) } });
}
/** Injection is test-only code wiring; production has no fixture env switch or fallback. */
export function createDecisionHandler(env: Environment, fetcher = fetch, timeoutMs = 12_000) {
  return async (request: Request): Promise<Response> => {
    const active = configured(env);
    if (request.method === 'GET') return json({ status: active ? 'READY' : 'DISABLED',
      message: active ? 'Ready. Enter your private access code to ask Etta.' : 'Mind connection is off. The room still works with manual controls.',
      limits: { perMinute: 4, perUtcDay: 40, maxOutputTokens: 256 } });
    if (request.method !== 'POST') return json({ provenance: 'ERROR', code: 'METHOD', message: 'Use POST to request a decision.' }, 405);
    try {
      if (!active) throw new HttpError(503, 'DISABLED', 'Mind connection is off or server configuration is incomplete.');
      if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') {
        throw new HttpError(403, 'ORIGIN', 'Request origin is not permitted.');
      }
      const bearer = request.headers.get('authorization') || '';
      if (bearer.length > 256 || !timingSafeEqual(createHash('sha256').update(bearer).digest(),
          createHash('sha256').update(`Bearer ${env.ETTA_ACCESS_TOKEN}`).digest())) {
        throw new HttpError(401, 'ACCESS_DENIED', 'The private access code was not accepted.');
      }
      if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get('content-type') || '')) {
        throw new HttpError(415, 'CONTENT_TYPE', 'Send application/json.');
      }
      let state;
      try {
        const payload: unknown = JSON.parse(await readLimited(request, 2048));
        if (!record(payload) || Object.keys(payload).length !== 1 || !Object.hasOwn(payload, 'snapshot')) throw new Error();
        state = parseSnapshot(payload.snapshot);
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(400, 'SNAPSHOT', 'The world snapshot was not valid.');
      }
      const signal = AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
      const started = Date.now();
      await reserveBudget(env.UPSTASH_REDIS_REST_URL!, env.UPSTASH_REDIS_REST_TOKEN!, signal, fetcher);
      const model = env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
      const proposal = await requestProposal(state, env.GEMINI_API_KEY!, model, signal, fetcher);
      return json({ provenance: 'MODEL_DECISION', proposal, model, elapsedMs: Date.now() - started });
    } catch (error) {
      const known = error instanceof HttpError ? error : new HttpError(500, 'INTERNAL', 'The request failed. Nothing was executed.');
      // Provider bodies, request headers and credentials are never returned or logged.
      return json({ provenance: known.code === 'DISABLED' ? 'DISABLED' : 'ERROR', code: known.code, message: known.message }, known.status);
    }
  };
}
