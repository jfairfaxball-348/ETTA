/** Runs the exact production Lua script against an isolated CI Redis service. */
import { connect } from 'node:net';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { BUDGET_SCRIPT } from '../server/budget.ts';
import { AUTH_SCRIPT } from '../server/auth.ts';
function command(...args) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: '127.0.0.1', port: 6379 });
    let response = '';
    socket.setTimeout(5000, () => socket.destroy(new Error('Redis test timed out')));
    socket.on('error', reject);
    socket.on('connect', () => socket.write(`*${args.length}\r\n` + args.map(arg => {
      const text = String(arg); return `$${Buffer.byteLength(text)}\r\n${text}\r\n`;
    }).join('')));
    socket.on('data', data => {
      response += data.toString();
      if (!response.endsWith('\r\n')) return;
      // Tests use integer/status commands only.
      if (response[0] === ':') { socket.end(); resolve(Number(response.slice(1).trim())); }
      else if (response[0] === '+') { socket.end(); resolve(response.slice(1).trim()); }
      else if (response[0] === '-') socket.destroy(new Error(response.slice(1).trim()));
    });
  });
}
const prefix = 'etta:mind:test:' + randomUUID();
const evalScript = script => command('EVAL', script, 1, prefix);
// Return a scalar so the tiny test transport never needs to parse Redis arrays.
const second = await evalScript("return tonumber(redis.call('TIME')[1]) % 60");
if (second >= 58) await new Promise(resolve => setTimeout(resolve, (61 - second) * 1000));
try {
  const replies = await Promise.all(Array.from({ length: 20 }, () => evalScript(BUDGET_SCRIPT)));
  assert.equal(replies.filter(r => r === 0).length, 4);
  assert.equal(replies.filter(r => r === 60).length, 16);
  const minuteTtl = await evalScript("local t=tonumber(redis.call('TIME')[1]); return redis.call('TTL', KEYS[1]..':minute:'..math.floor(t/60))");
  assert.ok(minuteTtl > 0 && minuteTtl <= 120);
  const resetMinute = "local t=tonumber(redis.call('TIME')[1]); return redis.call('DEL', KEYS[1]..':minute:'..math.floor(t/60))";
  for (let i = 0; i < 9; i++) {
    await evalScript(resetMinute);
    const next = await Promise.all(Array.from({ length: 4 }, () => evalScript(BUDGET_SCRIPT)));
    assert.deepEqual(next, [0, 0, 0, 0]);
  }
  await evalScript(resetMinute);
  assert.equal(await evalScript(BUDGET_SCRIPT), 86400);
  const count = await evalScript("local t=tonumber(redis.call('TIME')[1]); return tonumber(redis.call('GET', KEYS[1]..':day:'..math.floor(t/86400)))");
  assert.equal(count, 40);
  const dayTtl = await evalScript("local t=tonumber(redis.call('TIME')[1]); return redis.call('TTL', KEYS[1]..':day:'..math.floor(t/86400))");
  assert.ok(dayTtl > 0 && dayTtl <= 172800);
  console.log('PASS actual Redis Lua: concurrent global 4/minute, 40/UTC-day, failed reservations do not increment, counters expire.');
  // Exact production PIN-auth script: atomic across instances/requests, no model reservation.
  const auth = (client, valid) => command('EVAL', AUTH_SCRIPT, 1, prefix + ':auth', client, valid ? '1' : '0');
  const shared = await Promise.all(Array.from({length:15},() => auth('same-client','')));
  assert.equal(shared.filter(x=>x===1).length,6);
  assert.equal(shared.filter(x=>x===2).length,9);
  assert.equal(await auth('same-client',true),2,'Correct PIN cannot evade existing lock');
  assert.equal(await auth('different-client',true),0);
  for(let i=0;i<54;i++) assert.equal(await auth('distinct-'+i,false),1);
  assert.equal(await auth('new-client',true),2,'Aggregate lockout also blocks correct PIN');
  const ttl = await command('EVAL',
    "local t=tonumber(redis.call('TIME')[1]);return redis.call('TTL', KEYS[1]..':global:'..math.floor(t/900))",
    1, prefix + ':auth');
  assert.ok(ttl>0 && ttl<=1800);
  console.log('PASS actual Redis PIN Lua: concurrent 6/client and 60/global rejected attempts; fail-closed lockouts and TTL.');

} finally {
  await evalScript("local keys=redis.call('KEYS', KEYS[1]..':*'); for _,k in ipairs(keys) do redis.call('DEL', k) end; return #keys");
}
