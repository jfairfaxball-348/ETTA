import { HttpError, readLimited } from './http.ts';
import { record } from '../src/mind/protocol.ts';

// One atomic global reservation across all function instances, tabs and users.
// Failed/timed-out provider attempts still consume budget. Redis owns the clock.
export const BUDGET_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
local minute = KEYS[1] .. ':minute:' .. math.floor(now / 60)
local day = KEYS[1] .. ':day:' .. math.floor(now / 86400)
if tonumber(redis.call('GET', minute) or '0') >= 4 then return 60 end
if tonumber(redis.call('GET', day) or '0') >= 40 then return 86400 end
redis.call('INCR', minute)
redis.call('EXPIRE', minute, 120)
redis.call('INCR', day)
redis.call('EXPIRE', day, 172800)
return 0`;

export async function reserveBudget(url: string, token: string, signal: AbortSignal, fetcher = fetch): Promise<void> {
  try {
    const response = await fetcher(url, {
      method: 'POST', redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', BUDGET_SCRIPT, '1', 'etta:mind:budget:v1'])
    });
    if (!response.ok) throw new Error('Budget unavailable');
    const body: unknown = JSON.parse(await readLimited(response, 1024));
    if (!record(body) || body.error || ![0, 60, 86400].includes(body.result as number)) throw new Error('Invalid budget response');
    if (body.result !== 0) throw new HttpError(429, 'BUDGET_EXHAUSTED', 'Etta’s shared request budget is used up. Try again later.');
  } catch (error) {
    if (error instanceof HttpError && error.status === 429) throw error;
    throw new HttpError(503, 'BUDGET_UNAVAILABLE', 'Request budget could not be checked. No model request was made.');
  }
}
