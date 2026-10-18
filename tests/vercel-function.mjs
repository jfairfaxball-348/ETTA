// CI-only: load the function exactly as `vercel build` packaged it and exercise the
// unconfigured paths. No credentials exist here, so every inference path must be DISABLED.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const func = resolve(process.argv[2] || '.vercel/output/functions/api/decision.func');
const config = JSON.parse(readFileSync(join(func, '.vc-config.json'), 'utf8'));
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(join(dir, e.name))) : [join(dir, e.name)]);
for (const file of walk(func).filter((f) => f.endsWith('.js'))) {
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
    assert.match(spec, /\.js$/, `${file} imports ${spec}`);
  }
}
const handler = (await import(pathToFileURL(join(func, config.handler)).href)).default;
const get = await handler.fetch(new Request('https://etta.test/api/decision'));
assert.equal(get.status, 200);
assert.equal((await get.json()).status, 'DISABLED');
const post = await handler.fetch(new Request('https://etta.test/api/decision', { method: 'POST',
  headers: { origin: 'https://etta.test', 'content-type': 'application/json' }, body: '{}' }));
assert.equal(post.status, 503);
assert.equal((await post.json()).code, 'DISABLED');
console.log(JSON.stringify({ check: 'VERCEL_PACKAGED_FUNCTION', runtime: config.runtime, handler: config.handler,
  get: 200, post: 503, result: 'PASS' }));
