/** Serverless-safe PIN admission. Every PIN attempt is atomically checked against
 * shared failure windows before any model-budget reservation. Redis clock owns time.
 * Client address is accepted only from Vercel's platform-overwritten header. */
import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpError, readLimited } from './http.ts';
import { record } from '../src/mind/protocol.ts';

export const AUTH_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
local slot = math.floor(now / 900)
local global = KEYS[1] .. ':global:' .. slot
local client = KEYS[1] .. ':client:' .. ARGV[1] .. ':' .. slot
local g = tonumber(redis.call('GET', global) or '0')
local c = tonumber(redis.call('GET', client) or '0')
if g >= 60 or c >= 6 then return 2 end
if ARGV[2] == '0' then
  redis.call('INCR', global)
  redis.call('EXPIRE', global, 1800)
  redis.call('INCR', client)
  redis.call('EXPIRE', client, 1800)
  return 1
end
return 0`;

function clientBucket(request: Request, vercel: boolean): string {
  // Vercel overrides X-Vercel-Forwarded-For; do not trust arbitrary client headers elsewhere.
  const address = vercel ? (request.headers.get('x-vercel-forwarded-for') || '') : '';
  const normalized = /^[a-fA-F0-9:.]{2,45}$/.test(address) || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(address)
    ? address : 'unknown';
  return createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

export async function authenticatePin(request: Request, expected: string, redisUrl: string, redisToken: string,
  signal: AbortSignal, fetcher = fetch, vercel = false): Promise<void> {
  const bearer = request.headers.get('authorization') || '';
  const raw = bearer.startsWith('Bearer ') ? bearer.slice(7) : '';
  const canonical = /^\d{4}$/.test(raw) && bearer.length === 11;
  const actual = createHash('sha256').update(bearer.slice(0, 256)).digest();
  const target = createHash('sha256').update('Bearer ' + expected).digest();
  const correct = canonical && timingSafeEqual(actual, target);
  try {
    const response = await fetcher(redisUrl, {
      method: 'POST', redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]),
      headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', AUTH_SCRIPT, '1', 'etta:mind:auth:v1',
        clientBucket(request, vercel), correct ? '1' : '0'])
    });
    if (!response.ok) throw new Error('Redis rejected admission');
    const body: unknown = JSON.parse(await readLimited(response, 1024));
    if (!record(body) || body.error || ![0, 1, 2].includes(body.result as number)) throw new Error('Invalid auth response');
    if (body.result === 2) throw new HttpError(429, 'ACCESS_LOCKED', 'Too many incorrect PIN attempts. Try again later.');
    if (body.result !== (correct ? 0 : 1)) throw new Error('Inconsistent auth result');
    if (!correct) throw new HttpError(401, 'ACCESS_DENIED', 'The private PIN was not accepted.');
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(503, 'AUTH_UNAVAILABLE', 'PIN verification is unavailable. No model request was made.');
  }
}
